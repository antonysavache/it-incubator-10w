import { CommentsQueryRepository } from "../../infrastructure/repositories/comments-query.repository";
import { CommentViewModel } from "../../domain/interfaces/comment.interface";
import { Result } from "../../../../shared/infrastructures/result";

export class GetCommentUseCase {
    constructor(private commentsQueryRepository: CommentsQueryRepository) {}

    async execute(id: string, userId?: string): Promise<Result<CommentViewModel>> {
        console.log(`GetCommentUseCase executing with id=${id}, userId=${userId}`);

        const comment = await this.commentsQueryRepository.findPublicById(id, userId);
        if (!comment) {
            return Result.fail('Comment not found');
        }

        console.log(`GetCommentUseCase found comment:`, JSON.stringify(comment));
        return Result.ok(comment);
    }
}