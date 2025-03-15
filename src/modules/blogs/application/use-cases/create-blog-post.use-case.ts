import {BlogsQueryRepository} from "../../infrastructure/repositories/blogs-query.repository";
import {PostsCommandRepository} from "../../../posts/infrastructure/repositories/posts-command.repository";
import {PostCreateDTO, PostViewModel} from "../../../posts/domain/interfaces/post.interface";
import {Result} from "../../../../shared/infrastructures/result";
import {PostEntity} from "../../../posts/domain/post.entity";

export class CreateBlogPostUseCase {
    constructor(
        private blogsQueryRepository: BlogsQueryRepository,
        private postsCommandRepository: PostsCommandRepository
    ) {}

    async execute(blogId: string, dto: Omit<PostCreateDTO, 'blogId' | 'blogName'>): Promise<Result<PostViewModel>> {
        const blog = await this.blogsQueryRepository.findById(blogId);

        if (!blog) {
            return Result.fail('Blog not found');
        }

        const post = PostEntity.create({
            ...dto,
            blogId,
            blogName: blog.name
        });

        const id = await this.postsCommandRepository.create(post.toDatabaseModel());
        return Result.ok(post.toViewModel());
    }
}