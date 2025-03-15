import {
    DeleteAllDataUseCase,
    TestingController
} from "../../modules/testing/application/use-cases/delete-all-data.use-case";
import {
    blogsCommandRepository, deviceCommandRepository,
    postsCommandRepository,
    tokenCommandRepository,
    usersCommandRepository
} from "./repositories";

export const deleteAllDataUseCase = new DeleteAllDataUseCase(
    blogsCommandRepository,
    postsCommandRepository,
    usersCommandRepository,
    tokenCommandRepository,
    deviceCommandRepository,
);

export const testingController = new TestingController(
    deleteAllDataUseCase
);