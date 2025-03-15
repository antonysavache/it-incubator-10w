import { Request, Response } from 'express';
import {BlogsCommandRepository} from "../../../blogs/infrastructure/repositories/blogs-command.repository";
import {PostsCommandRepository} from "../../../posts/infrastructure/repositories/posts-command.repository";
import {UsersCommandRepository} from "../../../users/domain/infrastructures/repositories/users-command.repository";
import {TokenCommandRepository} from "../../../auth/infrastructure/repositories/token-command.repository";
import {DeviceCommandRepository} from "../../../auth/infrastructure/repositories/device-command.repository";

export class DeleteAllDataUseCase {
    constructor(
        private blogsCommandRepository: BlogsCommandRepository,
        private postsCommandRepository: PostsCommandRepository,
        private usersCommandRepository: UsersCommandRepository,
        private tokenCommandRepository: TokenCommandRepository,
        private deviceCommandRepository: DeviceCommandRepository
    ) {}

    async execute(): Promise<void> {
        await Promise.all([
            this.blogsCommandRepository.deleteAll(),
            this.postsCommandRepository.deleteAll(),
            this.usersCommandRepository.deleteAll(),
            this.tokenCommandRepository.deleteAll(),
            this.deviceCommandRepository.deleteAll()
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