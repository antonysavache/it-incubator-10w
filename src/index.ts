import { app } from "./app";
import { SETTINGS } from "./configs/settings";
import { connectToDatabase } from "./shared/infrastructures/db/mongo-db";
import {
    blogsCommandRepository,
    blogsQueryRepository,
    commentsCommandRepository,
    commentsQueryRepository,
    deviceCommandRepository,
    deviceQueryRepository, likeStatusCommandRepository, likeStatusQueryRepository,
    passwordRecoveryRepository, postLikeStatusCommandRepository, postLikeStatusQueryRepository,
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

        // Initialize all repositories
        console.log('Initializing repositories...');

        // Blog repositories
        blogsQueryRepository.init();
        blogsCommandRepository.init();

        // Post repositories
        postsQueryRepository.init();
        postsCommandRepository.init();

        // Post like status repositories
        postLikeStatusCommandRepository.init();
        postLikeStatusQueryRepository.init();
        console.log('Post like repositories initialized');

        // User repositories
        usersQueryRepository.init();
        usersCommandRepository.init();

        // Auth repositories
        tokenCommandRepository.init();
        tokenQueryRepository.init();
        userConfirmationRepository.init();
        passwordRecoveryRepository.init();
        deviceCommandRepository.init();
        deviceQueryRepository.init();

        // Comment repositories
        commentsCommandRepository.init();
        commentsQueryRepository.init();
        likeStatusCommandRepository.init();
        likeStatusQueryRepository.init();
        app.listen(SETTINGS.PORT, () => {
            console.log(`Server started on port: ${SETTINGS.PORT}`);
        });
    } catch (e) {
        console.log('Server error:', e);
        process.exit(1);
    }
}

startApp();