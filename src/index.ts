import { app } from "./app";
import { SETTINGS } from "./configs/settings";
import { connectToDatabase } from "./shared/infrastructures/db/mongo-db";
import {
    blogsCommandRepository,
    blogsQueryRepository,
    commentsCommandRepository,
    commentsQueryRepository,
    deviceCommandRepository,
    deviceQueryRepository,
    postsCommandRepository,
    postsQueryRepository,
    tokenCommandRepository,
    tokenQueryRepository,
    userConfirmationRepository,
    usersCommandRepository,
    usersQueryRepository
} from "./configs/compositions/repositories";


async function startApp() {
    try {
        await connectToDatabase();
        app.set('trust proxy', true);
        console.log('Connected to MongoDB');
        blogsQueryRepository.init();
        blogsCommandRepository.init();
        postsQueryRepository.init();
        postsCommandRepository.init();
        usersQueryRepository.init();
        usersCommandRepository.init();
        tokenCommandRepository.init();
        tokenQueryRepository.init();
        userConfirmationRepository.init();
        commentsCommandRepository.init();
        commentsQueryRepository.init();
        deviceCommandRepository.init();
        deviceQueryRepository.init();
        app.listen(SETTINGS.PORT, () => {
            console.log(`Server started on port: ${SETTINGS.PORT}`);
        });
    } catch (e) {
        console.log('Server error:', e);
        process.exit(1);
    }
}

startApp();