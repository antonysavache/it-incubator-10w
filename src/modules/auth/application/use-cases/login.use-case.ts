// src/modules/auth/application/use-cases/login.use-case.ts
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
// ... other imports ...
import { JwtService } from "../../../../shared/services/jwt.service"; // Ensure correct path
import { TOKEN_SETTINGS } from "../../domain/interfaces/token.interface";
import {UsersQueryRepository} from "../../../users/domain/infrastructures/repositories/users-query.repository";
import {TokenCommandRepository} from "../../infrastructure/repositories/token-command.repository";
import {DeviceCommandRepository} from "../../infrastructure/repositories/device-command.repository";
import {LoginDTO} from "../interfaces/auth.interface";
import {Result} from "../../../../shared/infrastructures/result"; // Ensure correct path

export class LoginUseCase {
    constructor(
        private usersQueryRepository: UsersQueryRepository,
        private tokenCommandRepository: TokenCommandRepository,
        private deviceCommandRepository: DeviceCommandRepository
    ) {}

    async execute(dto: LoginDTO, userAgent: string, ip: string): Promise<Result<{ accessToken: string, refreshToken: string }>> {
        const { loginOrEmail, password } = dto;

        const user = await this.usersQueryRepository.findByFilter({
            $or: [
                { login: loginOrEmail },
                { email: loginOrEmail }
            ]
        });

        if (!user) {
            return Result.fail('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return Result.fail('Invalid credentials');
        }

        const deviceId = uuidv4();
        const deviceTitle = userAgent || 'Unknown Device';
        const now = new Date();
        // Using shorter expiry for testing as per your previous code
        const refreshTokenExpiry = new Date(now.getTime() + 20000 * 1000); // 20 seconds

        // Pass user.login to JwtService
        const accessToken = JwtService.createJWT(
            user._id.toString(),
            TOKEN_SETTINGS.ACCESS_TOKEN_EXPIRATION, // Use configured expiration
            undefined, // No deviceId in access token
            user.login // Pass the actual login
        );

        const refreshToken = JwtService.createJWT(
            user._id.toString(),
            TOKEN_SETTINGS.REFRESH_TOKEN_EXPIRATION, // Use configured expiration
            deviceId,
            user.login // Pass the actual login
        );

        // Save tokens (assuming this repo handles expiry correctly based on JWT)
        // Consider if token repo needs expiry passed explicitly or reads from token
        await this.tokenCommandRepository.saveTokens(
            user._id.toString(),
            accessToken,
            refreshToken
        );

        // Save device session
        await this.deviceCommandRepository.create({
            deviceId,
            userId: user._id.toString(),
            ip,
            title: deviceTitle,
            lastActiveDate: now,
            expiresAt: refreshTokenExpiry, // Match refresh token expiry
            isActive: true
        });

        return Result.ok({ accessToken, refreshToken });
    }
}