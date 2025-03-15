import { CommentsQueryRepository } from "../../infrastructure/repositories/comments-query.repository";
import { CommentViewModel } from "../../domain/interfaces/comment.interface";
import { Result } from "../../../../shared/infrastructures/result";

export class GetCommentUseCase {
    constructor(private commentsQueryRepository: CommentsQueryRepository) {}

    async execute(id: string): Promise<Result<CommentViewModel>> {
        const comment = await this.commentsQueryRepository.findPublicById(id);
        if (!comment) {
            return Result.fail('Comment not found');
        }

        return Result.ok(comment);
    }
}