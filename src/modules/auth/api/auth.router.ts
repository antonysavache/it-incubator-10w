import { Router } from "express";
import { authController } from "../../../configs/compositions/auth.composition";
import { authValidationMiddleware } from "../../../configs/compositions/auth.composition";
import {jwtAuthMiddleware} from "../../../shared/infrastructures/middlewares/jwt-auth.middleware";
import {rateLimiterMiddleware} from "../../../shared/infrastructures/middlewares/rate-limiter.middleware";

export const authRouter = Router();

authRouter.post('/login', rateLimiterMiddleware('/auth/login'), authController.login);

authRouter.post('/registration',
    rateLimiterMiddleware('/registration'),
    authValidationMiddleware.registration,
    authController.register
);

authRouter.post('/registration-confirmation',
    rateLimiterMiddleware('/registration-confirmation'),
    authValidationMiddleware.confirmRegistration,
    authController.confirmRegistration
);

authRouter.post('/registration-email-resending',
    rateLimiterMiddleware('/registration-email-resending'),
    authValidationMiddleware.resendEmail,
    authController.resendConfirmation
);

authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', jwtAuthMiddleware, authController.getMe);