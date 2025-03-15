import {PostsCommandRepository} from "../../infrastructure/repositories/posts-command.repository";
import {Result} from "../../../../shared/infrastructures/result";

export class DeletePostUseCase {
    constructor(private postsCommandRepository: PostsCommandRepository) {}

    async execute(id: string): Promise<Result<void>> {
        const deleted = await this.postsCommandRepository.delete(id);
        if (!deleted) {
            return Result.fail('Post not found');
        }
        return Result.ok();
    }
}