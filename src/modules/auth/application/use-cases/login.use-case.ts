import bcrypt from 'bcrypt';
import { UsersQueryRepository } from "../../../users/domain/infrastructures/repositories/users-query.repository";
import { Result } from "../../../../shared/infrastructures/result";
import { TokenCommandRepository } from "../../infrastructure/repositories/token-command.repository";
import { LoginDTO } from "../interfaces/auth.interface";
import { TOKEN_SETTINGS } from "../../domain/interfaces/token.interface";
import { JwtService } from "../../../../shared/services/jwt.service";
import { v4 as uuidv4 } from 'uuid';
import { DeviceCommandRepository } from "../../infrastructure/repositories/device-command.repository";

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
        const accessTokenExpiry = new Date(now.getTime() + 1000 * 1000);
        const refreshTokenExpiry = new Date(now.getTime() + 20000 * 1000);

        const accessToken = JwtService.createJWT(
            user._id.toString(),
            TOKEN_SETTINGS.ACCESS_TOKEN_EXPIRATION
        );

        const refreshToken = JwtService.createJWT(
            user._id.toString(),
            TOKEN_SETTINGS.REFRESH_TOKEN_EXPIRATION,
            deviceId
        );

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
            expiresAt: refreshTokenExpiry,
            isActive: true
        });

        return Result.ok({ accessToken, refreshToken });
    }
}