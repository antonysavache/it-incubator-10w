import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../../../shared/infrastructures/middlewares/error-handler.middleware';
import { UserConfirmationRepository } from '../infrastructure/repositories/user-confirmation.repository';
import { UsersQueryRepository } from '../../users/domain/infrastructures/repositories/users-query.repository';

export class AuthValidationMiddleware {
    constructor(
        private userConfirmationRepository: UserConfirmationRepository,
        private usersQueryRepository: UsersQueryRepository
    ) {}

    registration = [
        body('login')
            .trim()
            .notEmpty().withMessage('Login is required')
            .isLength({ min: 3, max: 10 }).withMessage('Login should be 3-10 characters')
            .matches(/^[a-zA-Z0-9_-]*$/).withMessage('Login should contain only latin letters, numbers, dash and underscore'),

        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6, max: 20 }).withMessage('Password should be 6-20 characters'),

        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format'),

        handleValidationErrors
    ];

    confirmRegistration = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const code = req.body.code;

        if (!code) {
            return res.status(400).json({
                errorsMessages: [{
                    message: "Confirmation code is required",
                    field: "code"
                }]
            });
        }

        const confirmation = await this.userConfirmationRepository.findByCode(code);

        if (!confirmation) {
            return res.status(400).json({
                errorsMessages: [{
                    message: "Invalid confirmation code",
                    field: "code"
                }]
            });
        }

        if (confirmation.isConfirmed) {
            return res.status(400).json({
                errorsMessages: [{
                    message: "Email is already confirmed",
                    field: "code"
                }]
            });
        }

        if (confirmation.expirationDate < new Date()) {
            return res.status(400).json({
                errorsMessages: [{
                    message: "Confirmation code has expired",
                    field: "code"
                }]
            });
        }

        next();
    };

    resendEmail = [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format'),

        handleValidationErrors,

        async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
            const { email } = req.body;

            const user = await this.usersQueryRepository.findByFilter({ email: email.toLowerCase() });
            if (!user) {
                return res.status(400).json({
                    errorsMessages: [{
                        message: "User with this email doesn't exist",
                        field: "email"
                    }]
                });
            }

            const confirmation = await this.userConfirmationRepository.findByEmail(email.toLowerCase());

            // Handle case where email is already confirmed
            if (confirmation?.isConfirmed) {
                return res.status(400).json({
                    errorsMessages: [{
                        message: "Email is already confirmed",
                        field: "email"
                    }]
                });
            }

            next();
        }
    ];

}