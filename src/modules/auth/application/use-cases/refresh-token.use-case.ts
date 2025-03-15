// src/modules/auth/application/use-cases/refresh-token.use-case.ts
// Update to handle device info
import { Result } from "../../../../shared/infrastructures/result";
import { TokenCommandRepository } from "../../infrastructure/repositories/token-command.repository";
import { TokenQueryRepository } from "../../infrastructure/repositories/token-query.repository";
import { TOKEN_SETTINGS } from "../../domain/interfaces/token.interface";
import { JwtService } from "../../../../shared/services/jwt.service";
import { DeviceCommandRepository } from "../../infrastructure/repositories/device-command.repository";
import { DeviceQueryRepository } from "../../infrastructure/repositories/device-query.repository";

export class RefreshTokenUseCase {
    constructor(
        private tokenCommandRepository: TokenCommandRepository,
        private tokenQueryRepository: TokenQueryRepository,
        private deviceCommandRepository: DeviceCommandRepository,
        private deviceQueryRepository: DeviceQueryRepository
    ) {}

    async execute(refreshToken: string): Promise<Result<{ accessToken: string, refreshToken: string }>> {
        try {
            // Basic validation
            if (!refreshToken) {
                return Result.fail('Refresh token is required');
            }

            // Verify JWT token structure and expiration
            const payload = JwtService.verifyToken(refreshToken);
            if (!payload || !payload.deviceId) {
                return Result.fail('Invalid refresh token');
            }

            // Check if token exists in database and is still valid
            const tokenDoc = await this.tokenQueryRepository.findValidToken(refreshToken, 'REFRESH');
            if (!tokenDoc) {
                return Result.fail('Invalid refresh token');
            }

            // Check if device exists and is active
            const device = await this.deviceQueryRepository.findByDeviceId(payload.deviceId);
            if (!device) {
                return Result.fail('Device session not found');
            }

            // Check if token has expired in database
            if (new Date() > tokenDoc.expiresAt) {
                await this.tokenCommandRepository.invalidateToken(refreshToken);
                await this.deviceCommandRepository.deactivateDevice(payload.deviceId);
                return Result.fail('Token expired');
            }

            // Invalidate the current refresh token
            await this.tokenCommandRepository.invalidateToken(refreshToken);

            // Generate new tokens
            const newAccessToken = JwtService.createJWT(
                payload.userId,
                TOKEN_SETTINGS.ACCESS_TOKEN_EXPIRATION
            );

            const newRefreshToken = JwtService.createJWT(
                payload.userId,
                TOKEN_SETTINGS.REFRESH_TOKEN_EXPIRATION,
                payload.deviceId
            );

            // Save new tokens to database
            await this.tokenCommandRepository.saveTokens(
                payload.userId,
                newAccessToken,
                newRefreshToken
            );

            // Update device last active date
            const now = new Date();
            const newExpiry = new Date(now.getTime() + 20 * 1000); // 20 seconds
            await this.deviceCommandRepository.updateLastActiveDate(payload.deviceId, now, newExpiry);

            // Return new tokens
            return Result.ok({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });

        } catch (error) {
            // Log error for debugging but don't expose details to client
            console.error('Refresh token error:', error);
            return Result.fail('Invalid refresh token');
        }
    }
}