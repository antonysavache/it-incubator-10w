import {Result} from "../../../../shared/infrastructures/result";
import {BlogsCommandRepository} from "../../infrastructure/repositories/blogs-command.repository";

export class DeleteBlogUseCase {
    constructor(private blogsCommandRepository: BlogsCommandRepository) {}

    async execute(id: string): Promise<Result<void>> {
        const deleted = await this.blogsCommandRepository.delete(id);

        if (!deleted) {
            return Result.fail('Blog not found');
        }

        return Result.ok();
    }
}