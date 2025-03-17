import { Result } from "../../../../shared/infrastructures/result";
import { UsersCommandRepository } from "../../../users/domain/infrastructures/repositories/users-command.repository";
import { Password } from "../../../../shared/value-objects/password.value-object";
import { SETTINGS } from "../../../../configs/settings";
import { PasswordRecoveryConfirmDTO } from "../../domain/interfaces/password-recovery.interface";
import {PasswordRecoveryRepository} from "../../infrastructure/repositories/password-recovery-command.repository";

export class ConfirmPasswordRecoveryUseCase {
    constructor(
        private passwordRecoveryRepository: PasswordRecoveryRepository,
        private usersCommandRepository: UsersCommandRepository
    ) {}

    async execute(dto: PasswordRecoveryConfirmDTO): Promise<Result<void>> {
        const { recoveryCode, newPassword } = dto;
        try {
            if (!recoveryCode?.trim()) {
                return Result.fail({
                    errorsMessages: [{
                        message: "Recovery code is required",
                        field: "recoveryCode"
                    }]
                });
            }

            if (!newPassword?.trim()) {
                return Result.fail({
                    errorsMessages: [{
                        message: "Password is required",
                        field: "newPassword"
                    }]
                });
            }

            if (newPassword.length < 6 || newPassword.length > 20) {
                return Result.fail({
                    errorsMessages: [{
                        message: "Password should be 6-20 characters",
                        field: "newPassword"
                    }]
                });
            }

            const recovery = await this.passwordRecoveryRepository.findByCode(recoveryCode);

            if (!recovery) {
                return Result.fail('Invalid recovery code');
            }

            if (recovery.isUsed) {
                return Result.fail('Recovery code has already been used');
            }

            if (recovery.expirationDate < new Date()) {
                return Result.fail('Recovery code has expired');
            }

            const passwordObj = Password.create(newPassword);
            if (passwordObj.isFailure()) {
                return Result.fail(passwordObj.getError());
            }

            const hashedPassword = await passwordObj.getValue().hash(SETTINGS.SALT_ROUNDS);

            const updated = await this.usersCommandRepository.updatePassword(
                recovery.userId,
                hashedPassword
            );

            if (!updated) {
                return Result.fail('Failed to update password');
            }

            await this.passwordRecoveryRepository.markAsUsed(recoveryCode);

            return Result.ok();
        } catch (error) {
            console.error('Error in password recovery confirmation:', error);
            return Result.fail('An error occurred while processing your request');
        }
    }
}