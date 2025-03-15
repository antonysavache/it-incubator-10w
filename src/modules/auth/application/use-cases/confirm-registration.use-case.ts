import { Result } from "../../../../shared/infrastructures/result";
import { UserConfirmationRepository } from "../../infrastructure/repositories/user-confirmation.repository";

export class ConfirmRegistrationUseCase {
    constructor(
        private userConfirmationRepository: UserConfirmationRepository
    ) {}

    async execute(code: string): Promise<Result<void>> {
        const confirmation = await this.userConfirmationRepository.findByCode(code);

        if (!confirmation) {
            return Result.fail('Invalid confirmation code');
        }

        if (confirmation.isConfirmed) {
            return Result.fail('Email already confirmed');
        }

        if (confirmation.expirationDate < new Date()) {
            return Result.fail('Confirmation code has expired');
        }

        const updated = await this.userConfirmationRepository.updateConfirmationStatus(
            confirmation._id.toString(),
            true
        );

        if (!updated) {
            return Result.fail('Failed to confirm email');
        }

        return Result.ok();
    }
}