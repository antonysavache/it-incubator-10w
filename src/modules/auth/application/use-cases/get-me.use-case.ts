import { Result } from "../../../../shared/infrastructures/result";
import { UsersQueryRepository } from "../../../users/domain/infrastructures/repositories/users-query.repository";
import { MeViewModel } from "../../domain/interfaces/token.interface";
import { ObjectId } from "mongodb";

export class GetMeUseCase {
    constructor(
        private usersQueryRepository: UsersQueryRepository
    ) {}

    async execute(userId: string): Promise<Result<MeViewModel>> {
        const user = await this.usersQueryRepository.findById(userId);

        if (!user) {
            return Result.fail('User not found');
        }

        return Result.ok({
            email: user.email,
            login: user.login,
            userId: user.id
        });
    }
}