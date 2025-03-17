import { Result } from "../../../../shared/infrastructures/result";
import { UsersQueryRepository } from "../../../users/domain/infrastructures/repositories/users-query.repository";
import { EmailService } from "../../infrastructure/services/email.service";
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from "mongodb";
import { Email } from "../../../../shared/value-objects/email.value-object";
import {PasswordRecoveryRepository} from "../../infrastructure/repositories/password-recovery-command.repository";

export class RequestPasswordRecoveryUseCase {
    constructor(
        private passwordRecoveryRepository: PasswordRecoveryRepository,
        private emailService: EmailService,
        private usersQueryRepository: UsersQueryRepository
    ) {}

    async execute(email: string): Promise<Result<void>> {
        try {
            // Валидация email
            const emailValidation = Email.validate(email);
            if (!emailValidation.isValid) {
                return Result.fail({ errorsMessages: emailValidation.errors });
            }

            const lowerEmail = email.toLowerCase();
            console.log('Executing password recovery for email:', lowerEmail);

            // Проверка доступности сервиса email
            const isEmailServiceWorking = await this.emailService.verifyConnection();
            if (!isEmailServiceWorking) {
                console.error('Email service is not working');
                return Result.fail('Email service is temporarily unavailable');
            }

            // Поиск пользователя по email
            const user = await this.usersQueryRepository.findByFilter({ email: lowerEmail });
            if (!user) {
                // Для безопасности не раскрываем, существует ли email в системе
                // Возвращаем успешный результат, даже если email не найден
                console.log('User not found for email, but sending success response:', lowerEmail);
                return Result.ok();
            }

            // Проверка, существует ли уже запрос на восстановление и его деактивация
            const existingRecovery = await this.passwordRecoveryRepository.findByUserId(user._id.toString());
            if (existingRecovery) {
                await this.passwordRecoveryRepository.markAsUsed(existingRecovery.recoveryCode);
            }

            // Генерация нового кода восстановления
            const recoveryCode = uuidv4();
            console.log('Generated new recovery code:', recoveryCode);

            // Создание новой записи восстановления
            const recoveryData = {
                _id: new ObjectId(),
                userId: user._id.toString(),
                email: lowerEmail,
                recoveryCode,
                expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
                isUsed: false
            };

            await this.passwordRecoveryRepository.create(recoveryData);

            console.log('Sending password recovery email...');
            const emailSent = await this.emailService.sendPasswordRecoveryEmail(lowerEmail, recoveryCode);
            console.log('Email send result:', emailSent);

            if (!emailSent) {
                await this.passwordRecoveryRepository.markAsUsed(recoveryCode);
                return Result.fail('Failed to send recovery email');
            }

            console.log('Successfully sent password recovery email');
            return Result.ok();
        } catch (error) {
            console.error('Error in password recovery request:', error);
            return Result.fail('An error occurred while processing your request');
        }
    }
}