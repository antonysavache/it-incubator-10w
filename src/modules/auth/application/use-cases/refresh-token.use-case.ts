// src/modules/auth/application/use-cases/refresh-token.use-case.ts
import { Result } from "../../../../shared/infrastructures/result";
import { TokenCommandRepository } from "../../infrastructure/repositories/token-command.repository";
import { TokenQueryRepository } from "../../infrastructure/repositories/token-query.repository";
import { TOKEN_SETTINGS } from "../../domain/interfaces/token.interface";
import { JwtService } from "../../../../shared/services/jwt.service";
import { DeviceCommandRepository } from "../../infrastructure/repositories/device-command.repository";
import { DeviceQueryRepository } from "../../infrastructure/repositories/device-query.repository";
import { UsersQueryRepository } from '../../../users/domain/infrastructures/repositories/users-query.repository'; // Import user repo

export class RefreshTokenUseCase {
    constructor(
        private tokenCommandRepository: TokenCommandRepository,
        private tokenQueryRepository: TokenQueryRepository,
        private deviceCommandRepository: DeviceCommandRepository,
        private deviceQueryRepository: DeviceQueryRepository,
        private usersQueryRepository: UsersQueryRepository // Inject user repo
    ) {}

    async execute(refreshToken: string): Promise<Result<{ accessToken: string, refreshToken: string }>> {
        try {
            if (!refreshToken) return Result.fail('Refresh token is required');

            const payload = JwtService.verifyToken(refreshToken);
            if (!payload || !payload.deviceId || !payload.userId) { // Also check userId
                return Result.fail('Invalid refresh token payload');
            }

            const tokenDoc = await this.tokenQueryRepository.findValidToken(refreshToken, 'REFRESH');
            if (!tokenDoc) return Result.fail('Refresh token not found or invalid in DB');

            const device = await this.deviceQueryRepository.findByDeviceId(payload.deviceId);
            if (!device) return Result.fail('Device session not found');

            // Check if token has expired in database (redundant if verifyToken checks 'exp', but good defense)
            // if (new Date() > tokenDoc.expiresAt) {
            //     await this.tokenCommandRepository.invalidateToken(refreshToken);
            //     await this.deviceCommandRepository.deactivateDevice(payload.deviceId);
            //     return Result.fail('Token expired');
            // }

            // Fetch user to get the correct login
            const user = await this.usersQueryRepository.findById(payload.userId);
            if (!user) {
                console.error(`User not found during token refresh: userId=${payload.userId}`);
                // Decide whether to invalidate token/device here or just fail
                return Result.fail('User associated with token not found');
            }
            const userLogin = user.login; // Get the actual login

            await this.tokenCommandRepository.invalidateToken(refreshToken);

            const newAccessToken = JwtService.createJWT(
                payload.userId,
                TOKEN_SETTINGS.ACCESS_TOKEN_EXPIRATION,
                undefined,
                userLogin // Include actual login
            );

            const newRefreshToken = JwtService.createJWT(
                payload.userId,
                TOKEN_SETTINGS.REFRESH_TOKEN_EXPIRATION,
                payload.deviceId,
                userLogin // Include actual login
            );

            await this.tokenCommandRepository.saveTokens(
                payload.userId,
                newAccessToken,
                newRefreshToken
            );

            const now = new Date();
            // Use actual token expiry calculated by jwt.sign if possible, otherwise use fixed duration
            const newExpiry = new Date(now.getTime() + 20000 * 1000); // 20 seconds - match your previous logic
            // const decodedNewRefreshToken = JwtService.extractPayload(newRefreshToken);
            // const newExpiry = decodedNewRefreshToken?.exp ? new Date(decodedNewRefreshToken.exp * 1000) : new Date(now.getTime() + 20 * 60 * 1000); // Example: 20 min expiry

            await this.deviceCommandRepository.updateLastActiveDate(payload.deviceId, now, newExpiry);

            return Result.ok({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            return Result.fail('Invalid refresh token process');
        }
    }
}