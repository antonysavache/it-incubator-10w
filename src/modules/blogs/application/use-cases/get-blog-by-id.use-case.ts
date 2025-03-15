import {BlogsQueryRepository} from "../../infrastructure/repositories/blogs-query.repository";
import {Result} from "../../../../shared/infrastructures/result";
import {BlogViewModel} from "../../domain/interfaces/blog.interface";

export class GetBlogByIdUseCase {
    constructor(private blogsQueryRepository: BlogsQueryRepository) {}

    async execute(id: string): Promise<Result<BlogViewModel>> {
        const blog = await this.blogsQueryRepository.findById(id);

        if (!blog) {
            return Result.fail('Blog not found');
        }

        return Result.ok(blog);
    }
}