import { CommentsQueryRepository } from "../../infrastructure/repositories/comments-query.repository";
import { PostsQueryRepository } from "../../../posts/infrastructure/repositories/posts-query.repository";
import { Result } from "../../../../shared/infrastructures/result";
import { DEFAULT_QUERY_PARAMS, PageResponse } from "../../../../shared/models/common.model";
import { CommentViewModel } from "../../domain/interfaces/comment.interface";

export class GetCommentsUseCase {
    constructor(
        private commentsQueryRepository: CommentsQueryRepository,
        private postsQueryRepository: PostsQueryRepository
    ) {}

    async execute(
        postId: string,
        sortBy?: string,
        sortDirection?: 'asc' | 'desc',
        pageNumber?: string,
        pageSize?: string,
        userId?: string
    ): Promise<Result<PageResponse<CommentViewModel>>> {
        console.log(`GetCommentsUseCase executing with postId=${postId}, userId=${userId || 'none'}`);

        const post = await this.postsQueryRepository.findById(postId);
        if (!post) {
            return Result.fail('Post not found');
        }

        const comments = await this.commentsQueryRepository.findByPostId(
            postId,
            sortBy || DEFAULT_QUERY_PARAMS.sortBy,
            sortDirection || DEFAULT_QUERY_PARAMS.sortDirection,
            pageNumber || DEFAULT_QUERY_PARAMS.pageNumber,
            pageSize || DEFAULT_QUERY_PARAMS.pageSize,
            userId
        );

        // Log what we're returning
        console.log(`GetCommentsUseCase returning ${comments.items.length} comments for user ${userId || 'none'}`);

        return Result.ok(comments);
    }
}