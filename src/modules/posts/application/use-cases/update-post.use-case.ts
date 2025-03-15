import {BlogsQueryRepository} from "../../../blogs/infrastructure/repositories/blogs-query.repository";
import {PostsCommandRepository} from "../../infrastructure/repositories/posts-command.repository";
import {PostCreateDTO} from "../../domain/interfaces/post.interface";
import {Result} from "../../../../shared/infrastructures/result";

export class UpdatePostUseCase {
    constructor(
        private blogsQueryRepository: BlogsQueryRepository,
        private postsCommandRepository: PostsCommandRepository
    ) {}

    async execute(id: string, dto: PostCreateDTO): Promise<Result<void>> {
        const blog = await this.blogsQueryRepository.findById(dto.blogId);
        if (!blog) {
            return Result.fail('Blog not found');
        }

        const updated = await this.postsCommandRepository.update(id, {
            ...dto,
            blogName: blog.name
        });

        if (!updated) {
            return Result.fail('Post not found');
        }

        return Result.ok();
    }
}
