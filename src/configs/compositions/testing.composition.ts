import {
    DeleteAllDataUseCase,
    TestingController
} from "../../modules/testing/application/use-cases/delete-all-data.use-case";
import {
    blogsCommandRepository, commentsCommandRepository,
    deviceCommandRepository, likeStatusCommandRepository,
    passwordRecoveryRepository, postLikeStatusCommandRepository,
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
    passwordRecoveryRepository,
    commentsCommandRepository,
    likeStatusCommandRepository,
    postLikeStatusCommandRepository
);

export const testingController = new TestingController(
    deleteAllDataUseCase
);