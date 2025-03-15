import {runDb} from "../it-incubator-5w/src/shared/db/mongo-db";
import {
    blogsCommandRepository,
    blogsQueryRepository,
    postsCommandRepository,
    postsQueryRepository, usersCommandRepository, usersQueryRepository
} from "../it-incubator-5w/src/configs/composition-root";

beforeAll(async () => {
    await runDb();

    blogsQueryRepository.init();
    blogsCommandRepository.init();
    postsQueryRepository.init();
    postsCommandRepository.init();
    usersCommandRepository.init();
    usersQueryRepository.init();
})