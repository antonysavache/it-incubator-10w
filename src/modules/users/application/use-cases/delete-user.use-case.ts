import { Result } from "../../../../shared/infrastructures/result";
import { UsersCommandRepository } from "../../domain/infrastructures/repositories/users-command.repository";

export class DeleteUserUseCase {
    constructor(
        private usersCommandRepository: UsersCommandRepository
    ) {}

    async execute(id: string): Promise<Result<void>> {
        const deleted = await this.usersCommandRepository.delete(id);

        if (!deleted) {
            return Result.fail('User not found');
        }

        return Result.ok();
    }
}