import {BlogsQueryRepository} from "../../../blogs/infrastructure/repositories/blogs-query.repository";
import {PostsCommandRepository} from "../../infrastructure/repositories/posts-command.repository";
import {PostCreateDTO, PostViewModel} from "../../domain/interfaces/post.interface";
import {Result} from "../../../../shared/infrastructures/result";
import {PostEntity} from "../../domain/post.entity";

export class CreatePostUseCase {
    constructor(
        private blogsQueryRepository: BlogsQueryRepository,
        private postsCommandRepository: PostsCommandRepository
    ) {}

    async execute(dto: PostCreateDTO): Promise<Result<PostViewModel>> {
        const errors: { message: string; field: string }[] = [];

        if (dto.shortDescription && dto.shortDescription.length > 100) {
            errors.push({
                message: 'Short description should not exceed 100 characters',
                field: 'shortDescription'
            });
        }

        const blog = await this.blogsQueryRepository.findById(dto.blogId);
        if (!blog) {
            errors.push({
                message: 'Blog not found',
                field: 'blogId'
            });
        }

        if (errors.length > 0) {
            return Result.fail({ errorsMessages: errors });
        }

        const post = PostEntity.create({
            ...dto,
            blogName: blog!.name
        });

        await this.postsCommandRepository.create(post.toDatabaseModel());
        return Result.ok(post.toViewModel());
    }
}