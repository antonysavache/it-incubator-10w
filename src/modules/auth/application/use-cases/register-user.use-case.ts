import { Result } from "../../../../shared/infrastructures/result";
import { UsersQueryRepository } from "../../../users/domain/infrastructures/repositories/users-query.repository";
import { UserEntity } from "../../../users/domain/user.entity";
import { UserSpecification } from "../../../users/domain/specifications/user.specification";
import { UsersCommandRepository } from "../../../users/domain/infrastructures/repositories/users-command.repository";
import { EmailService } from "../../infrastructure/services/email.service";
import { UserConfirmationRepository } from "../../infrastructure/repositories/user-confirmation.repository";
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from "mongodb";

export class RegisterUserUseCase {
    constructor(
        private usersQueryRepository: UsersQueryRepository,
        private usersCommandRepository: UsersCommandRepository,
        private userSpecification: UserSpecification,
        private emailService: EmailService,
        private userConfirmationRepository: UserConfirmationRepository
    ) {}

    async execute(dto: { login: string; password: string; email: string }): Promise<Result<void>> {
        const userResult = await UserEntity.create(
            dto,
            this.userSpecification,
            this.usersQueryRepository
        );

        if (userResult.isFailure()) {
            return Result.fail(userResult.getError());
        }

        const user = userResult.getValue();
        const userId = await this.usersCommandRepository.create(user.toDatabaseModel());

        const confirmationCode = uuidv4();
        const confirmationData = {
            _id: new ObjectId(),
            userId,
            email: dto.email,
            confirmationCode,
            expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            isConfirmed: false
        };

        await this.userConfirmationRepository.create(confirmationData);
        const emailSent = await this.emailService.sendRegistrationEmail(dto.email, confirmationCode);

        if (!emailSent) {
            await this.usersCommandRepository.delete(userId);
            await this.userConfirmationRepository.delete(confirmationData._id.toString());
            return Result.fail('Failed to send confirmation email');
        }

        return Result.ok();
    }
}