import {BlogsCommandRepository} from "../../infrastructure/repositories/blogs-command.repository";
import {BlogCreateDTO} from "../../domain/interfaces/blog.interface";
import {Result} from "../../../../shared/infrastructures/result";

export class UpdateBlogUseCase {
    constructor(private blogsCommandRepository: BlogsCommandRepository) {}

    async execute(id: string, dto: BlogCreateDTO): Promise<Result<void>> {
        const updated = await this.blogsCommandRepository.update(id, dto);

        if (!updated) {
            return Result.fail('Blog not found');
        }

        return Result.ok();
    }
}