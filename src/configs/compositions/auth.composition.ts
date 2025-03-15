import { LoginUseCase } from "../../modules/auth/application/use-cases/login.use-case";
import { AuthController } from "../../modules/auth/api/auth.controller";
import { RegisterUserUseCase } from "../../modules/auth/application/use-cases/register-user.use-case";
import { ConfirmRegistrationUseCase } from "../../modules/auth/application/use-cases/confirm-registration.use-case";
import { ResendConfirmationUseCase } from "../../modules/auth/application/use-cases/resend-confirmation.use-case";
import { RefreshTokenUseCase } from "../../modules/auth/application/use-cases/refresh-token.use-case";
import { LogoutUseCase } from "../../modules/auth/application/use-cases/logout.use-case";
import { GetMeUseCase } from "../../modules/auth/application/use-cases/get-me.use-case";
import { EmailService } from "../../modules/auth/infrastructure/services/email.service";
import { AuthValidationMiddleware } from "../../modules/auth/api/auth-validation.middleware";
import {
    deviceCommandRepository, deviceQueryRepository,
    tokenCommandRepository,
    tokenQueryRepository,
    userConfirmationRepository,
    usersCommandRepository,
    usersQueryRepository
} from "./repositories";
import { userSpecification } from "./users-composition";

export const emailService = new EmailService();

export const loginUseCase = new LoginUseCase(
    usersQueryRepository,
    tokenCommandRepository,
    deviceCommandRepository
);

export const registerUserUseCase = new RegisterUserUseCase(
    usersQueryRepository,
    usersCommandRepository,
    userSpecification,
    emailService,
    userConfirmationRepository
);

export const confirmRegistrationUseCase = new ConfirmRegistrationUseCase(
    userConfirmationRepository
);

export const resendConfirmationUseCase = new ResendConfirmationUseCase(
    userConfirmationRepository,
    emailService,
    usersQueryRepository
);

export const refreshTokenUseCase = new RefreshTokenUseCase(
    tokenCommandRepository,
    tokenQueryRepository,
    deviceCommandRepository,
    deviceQueryRepository
);

export const logoutUseCase = new LogoutUseCase(
    tokenCommandRepository,
    tokenQueryRepository,
    deviceCommandRepository,
    deviceQueryRepository
);

export const getMeUseCase = new GetMeUseCase(
    usersQueryRepository
);

export const authValidationMiddleware = new AuthValidationMiddleware(
    userConfirmationRepository,
    usersQueryRepository
);

export const authController = new AuthController(
    loginUseCase,
    registerUserUseCase,
    confirmRegistrationUseCase,
    resendConfirmationUseCase,
    refreshTokenUseCase,
    logoutUseCase,
    getMeUseCase
);