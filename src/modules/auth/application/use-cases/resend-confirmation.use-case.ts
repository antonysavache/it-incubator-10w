import { Result } from "../../../../shared/infrastructures/result";
import { UserConfirmationRepository } from "../../infrastructure/repositories/user-confirmation.repository";
import { EmailService } from "../../infrastructure/services/email.service";
import { v4 as uuidv4 } from 'uuid';
import { UsersQueryRepository } from "../../../users/domain/infrastructures/repositories/users-query.repository";

export class ResendConfirmationUseCase {
    constructor(
        private userConfirmationRepository: UserConfirmationRepository,
        private emailService: EmailService,
        private usersQueryRepository: UsersQueryRepository
    ) {}

    async execute(email: string): Promise<Result<void>> {
        try {
            const lowerEmail = email.toLowerCase();
            console.log('Executing resend confirmation for email:', lowerEmail);

            const isEmailServiceWorking = await this.emailService.verifyConnection();
            if (!isEmailServiceWorking) {
                console.error('Email service is not working');
                return Result.fail('Email service is temporarily unavailable');
            }

            const user = await this.usersQueryRepository.findByFilter({ email: lowerEmail });
            if (!user) {
                console.log('User not found for email:', lowerEmail);
                return Result.fail('User not found');
            }

            const confirmation = await this.userConfirmationRepository.findByEmail(lowerEmail);
            if (!confirmation) {
                console.log('Confirmation not found for email:', lowerEmail);
                return Result.fail('Confirmation not found');
            }

            if (confirmation.isConfirmed) {
                console.log('Email already confirmed:', lowerEmail);
                return Result.fail('Email already confirmed');
            }

            const newCode = uuidv4();
            console.log('Generated new code:', newCode);

            const updated = await this.userConfirmationRepository.updateCode(lowerEmail, newCode);
            console.log('Update confirmation result:', updated);

            if (!updated) {
                console.log('Failed to update confirmation code');
                return Result.fail('Failed to update confirmation code');
            }

            console.log('Sending confirmation email...');
            const emailSent = await this.emailService.sendRegistrationEmail(lowerEmail, newCode);
            console.log('Email send result:', emailSent);

            if (!emailSent) {
                await this.userConfirmationRepository.updateCode(
                    lowerEmail,
                    confirmation.confirmationCode
                );
                return Result.fail('Failed to send email');
            }

            console.log('Successfully resent confirmation email');
            return Result.ok();
        } catch (error) {
            console.error('Error in resend confirmation:', error);
            return Result.fail('An error occurred while processing your request');
        }
    }
}