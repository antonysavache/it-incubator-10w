import { UsersQueryRepository } from "../../domain/infrastructures/repositories/users-query.repository";
import { UsersCommandRepository } from "../../domain/infrastructures/repositories/users-command.repository";
import { UserSpecification } from "../../domain/specifications/user.specification";
import { UserCreateDTO, UserViewModel } from "../../domain/interfaces/user.interface";
import { UserEntity } from "../../domain/user.entity";
import { Result } from "../../../../shared/infrastructures/result";

export class CreateUserUseCase {
    constructor(
        private usersQueryRepository: UsersQueryRepository,
        private usersCommandRepository: UsersCommandRepository,
        private userSpecification: UserSpecification
    ) {}

    async execute(dto: UserCreateDTO): Promise<Result<UserViewModel>> {
        const userResult = await UserEntity.create(
            dto,
            this.userSpecification,
            this.usersQueryRepository
        );

        if (userResult.isFailure()) {
            return Result.fail(userResult.getError());
        }

        const user = userResult.getValue();
        await this.usersCommandRepository.create(user.toDatabaseModel());

        const viewModel: UserViewModel = {
            id: user.toDatabaseModel()._id.toString(),
            login: user.toDatabaseModel().login,
            email: user.toDatabaseModel().email,
            createdAt: user.toDatabaseModel().createdAt
        };

        return Result.ok(viewModel);
    }
}