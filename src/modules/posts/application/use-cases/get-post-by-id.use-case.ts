import {PostsQueryRepository} from "../../infrastructure/repositories/posts-query.repository";
import {Result} from "../../../../shared/infrastructures/result";
import {PostViewModel} from "../../domain/interfaces/post.interface";

export class GetPostByIdUseCase {
    constructor(private postsQueryRepository: PostsQueryRepository) {}

    async execute(id: string): Promise<Result<PostViewModel>> {
        const post = await this.postsQueryRepository.findById(id);
        if (!post) {
            return Result.fail('Post not found');
        }
        return Result.ok(post);
    }
}