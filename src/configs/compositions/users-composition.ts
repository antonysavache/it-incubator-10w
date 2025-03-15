import { UserSpecification } from "../../modules/users/domain/specifications/user.specification";
import { CreateUserUseCase } from "../../modules/users/application/use-cases/create-user.use-case";
import { GetUsersUseCase } from "../../modules/users/application/use-cases/get-users.use-case";
import { UsersController } from "../../modules/users/api/users.controller";
import {usersCommandRepository, usersQueryRepository} from "./repositories";
import {DeleteUserUseCase} from "../../modules/users/application/use-cases/delete-user.use-case";

export const userSpecification = new UserSpecification();

export const createUserUseCase = new CreateUserUseCase(
    usersQueryRepository,
    usersCommandRepository,
    userSpecification
);

export const getUsersUseCase = new GetUsersUseCase(
    usersQueryRepository
);

export const deleteUserUseCase = new DeleteUserUseCase(
    usersCommandRepository
);

export const usersController = new UsersController(
    createUserUseCase,
    getUsersUseCase,
    deleteUserUseCase
);