import { Request, Response } from 'express';
import { BlogsCommandRepository } from "../../../blogs/infrastructure/repositories/blogs-command.repository";
import { PostsCommandRepository } from "../../../posts/infrastructure/repositories/posts-command.repository";
import { UsersCommandRepository } from "../../../users/domain/infrastructures/repositories/users-command.repository";
import { TokenCommandRepository } from "../../../auth/infrastructure/repositories/token-command.repository";
import { DeviceCommandRepository } from "../../../auth/infrastructure/repositories/device-command.repository";
import {
    PasswordRecoveryRepository
} from "../../../auth/infrastructure/repositories/password-recovery-command.repository";
import {CommentsCommandRepository} from "../../../comments/infrastructure/repositories/comments-command.repository";
import {
    LikeStatusCommandRepository
} from "../../../comments/infrastructure/repositories/like-status-command.repository";

export class DeleteAllDataUseCase {
    constructor(
        private blogsCommandRepository: BlogsCommandRepository,
        private postsCommandRepository: PostsCommandRepository,
        private usersCommandRepository: UsersCommandRepository,
        private tokenCommandRepository: TokenCommandRepository,
        private deviceCommandRepository: DeviceCommandRepository,
        private passwordRecoveryRepository: PasswordRecoveryRepository,
        private commentsCommandRepository: CommentsCommandRepository,
        private likeStatusCommandRepository: LikeStatusCommandRepository,
    ) {}

    async execute(): Promise<void> {
        await Promise.all([
            this.blogsCommandRepository.deleteAll(),
            this.postsCommandRepository.deleteAll(),
            this.usersCommandRepository.deleteAll(),
            this.tokenCommandRepository.deleteAll(),
            this.deviceCommandRepository.deleteAll(),
            this.passwordRecoveryRepository.deleteAll(),
            this.commentsCommandRepository.deleteAll(),
            this.likeStatusCommandRepository.deleteAll()
        ]);
    }
}

export class TestingController {
    constructor(private deleteAllDataUseCase: DeleteAllDataUseCase) {}

    deleteAllData = async (req: Request, res: Response) => {
        await this.deleteAllDataUseCase.execute();
        res.sendStatus(204);
    }
}