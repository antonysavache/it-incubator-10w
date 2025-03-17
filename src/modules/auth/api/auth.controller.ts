import { Request, Response } from 'express';
import { LoginUseCase } from "../application/use-cases/login.use-case";
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { ConfirmRegistrationUseCase } from '../application/use-cases/confirm-registration.use-case';
import { ResendConfirmationUseCase } from '../application/use-cases/resend-confirmation.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { GetMeUseCase } from '../application/use-cases/get-me.use-case';
import { RequestPasswordRecoveryUseCase } from '../application/use-cases/request-password-recovery.use-case';
import { ConfirmPasswordRecoveryUseCase } from '../application/use-cases/confirm-password-recovery.use-case';
import { LoginDTO } from "../application/interfaces/auth.interface";
import { TOKEN_SETTINGS } from '../domain/interfaces/token.interface';
import { RequestWithUser } from '../../../shared/types/express';
import { PasswordRecoveryRequestDTO, PasswordRecoveryConfirmDTO } from '../domain/interfaces/password-recovery.interface';

export class AuthController {
    constructor(
        private loginUseCase: LoginUseCase,
        private registerUserUseCase: RegisterUserUseCase,
        private confirmRegistrationUseCase: ConfirmRegistrationUseCase,
        private resendConfirmationUseCase: ResendConfirmationUseCase,
        private refreshTokenUseCase: RefreshTokenUseCase,
        private logoutUseCase: LogoutUseCase,
        private getMeUseCase: GetMeUseCase,
        private requestPasswordRecoveryUseCase: RequestPasswordRecoveryUseCase,
        private confirmPasswordRecoveryUseCase: ConfirmPasswordRecoveryUseCase
    ) {}

    login = async (req: Request<{}, {}, LoginDTO>, res: Response) => {
        try {
            const userAgent = req.headers['user-agent'] || 'Unknown Device';
            const ip = req.ip || '0.0.0.0';

            const result = await this.loginUseCase.execute(req.body, userAgent, ip);

            if (result.isFailure()) {
                return res.sendStatus(401);
            }

            const { accessToken, refreshToken } = result.getValue();

            res.cookie('refreshToken', refreshToken, TOKEN_SETTINGS.REFRESH_TOKEN_COOKIE);
            return res.status(200).json({ accessToken });
        } catch (error) {
            console.error('Login error:', error);
            return res.sendStatus(401);
        }
    }

    register = async (req: Request, res: Response) => {
        try {
            const result = await this.registerUserUseCase.execute(req.body);

            if (result.isFailure()) {
                const error = result.getError();
                if (typeof error === 'object' && 'errorsMessages' in error) {
                    return res.status(400).json(error);
                }
                return res.status(400).json({
                    errorsMessages: [{ message: error as string, field: 'none' }]
                });
            }

            return res.sendStatus(204);
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ error: 'Registration failed' });
        }
    }

    confirmRegistration = async (req: Request, res: Response) => {
        try {
            const result = await this.confirmRegistrationUseCase.execute(req.body.code);

            if (result.isFailure()) {
                return res.status(400).json({
                    errorsMessages: [{
                        message: result.getError(),
                        field: 'code'
                    }]
                });
            }

            return res.sendStatus(204);
        } catch (error) {
            console.error('Confirmation error:', error);
            return res.status(500).json({ error: 'Confirmation failed' });
        }
    }

    resendConfirmation = async (req: Request, res: Response) => {
        try {
            const result = await this.resendConfirmationUseCase.execute(req.body.email);

            if (result.isFailure()) {
                const error = result.getError();
                return res.status(400).json({
                    errorsMessages: [{
                        message: error,
                        field: 'email'
                    }]
                });
            }

            return res.sendStatus(204);
        } catch (error) {
            console.error('Resend confirmation error:', error);
            return res.status(500).json({ error: 'Failed to resend confirmation' });
        }
    }

    refreshToken = async (req: Request, res: Response) => {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.sendStatus(401);
            }

            const result = await this.refreshTokenUseCase.execute(refreshToken);

            if (result.isFailure()) {
                return res.sendStatus(401); // Always return 401 for token issues
            }

            const { accessToken, refreshToken: newRefreshToken } = result.getValue();

            res.cookie('refreshToken', newRefreshToken, TOKEN_SETTINGS.REFRESH_TOKEN_COOKIE);
            return res.status(200).json({ accessToken });
        } catch (error) {
            console.error('Refresh token error:', error);
            return res.sendStatus(401); // Convert all errors to 401
        }
    }

    logout = async (req: Request, res: Response) => {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.sendStatus(401);
            }

            const result = await this.logoutUseCase.execute(refreshToken);

            if (result.isFailure()) {
                return res.sendStatus(401);
            }

            res.clearCookie('refreshToken', {
                ...TOKEN_SETTINGS.REFRESH_TOKEN_COOKIE,
                maxAge: 0
            });

            return res.sendStatus(204);
        } catch (error) {
            console.error('Logout error:', error);
            return res.sendStatus(401);
        }
    }

    getMe = async (req: RequestWithUser, res: Response) => {
        try {
            const result = await this.getMeUseCase.execute(req.user.id);

            if (result.isFailure()) {
                return res.sendStatus(401);
            }

            return res.status(200).json(result.getValue());
        } catch (error) {
            console.error('Get me error:', error);
            return res.sendStatus(401);
        }
    }

    requestPasswordRecovery = async (req: Request<{}, {}, PasswordRecoveryRequestDTO>, res: Response) => {
        try {
            const result = await this.requestPasswordRecoveryUseCase.execute(req.body.email);

            if (result.isFailure()) {
                const error = result.getError();

                if (typeof error === 'object' && 'errorsMessages' in error) {
                    return res.status(400).json(error);
                }

                if (error === 'Email service is temporarily unavailable') {
                    return res.status(500).json({
                        errorsMessages: [{ message: error, field: 'none' }]
                    });
                }

                console.log('Error in password recovery, but returning 204 for security:', error);
            }

            return res.sendStatus(204);
        } catch (error) {
            console.error('Password recovery request error:', error);
            return res.status(500).json({ error: 'Password recovery request failed' });
        }
    }

    confirmPasswordRecovery = async (req: Request<{}, {}, PasswordRecoveryConfirmDTO>, res: Response) => {
        try {
            const result = await this.confirmPasswordRecoveryUseCase.execute(req.body);

            if (result.isFailure()) {
                const error = result.getError();

                if (typeof error === 'object' && 'errorsMessages' in error) {
                    return res.status(400).json(error);
                }

                const fieldMap: Record<string, string> = {
                    'Invalid recovery code': 'recoveryCode',
                    'Recovery code has already been used': 'recoveryCode',
                    'Recovery code has expired': 'recoveryCode',
                    'Failed to update password': 'newPassword'
                };

                const field = fieldMap[error as string] || 'recoveryCode';

                return res.status(400).json({
                    errorsMessages: [{ message: error as string, field: field }]
                });
            }

            return res.sendStatus(204);
        } catch (error) {
            console.error('Password recovery confirmation error:', error);
            return res.status(500).json({ error: 'Password recovery confirmation failed' });
        }
    }
}