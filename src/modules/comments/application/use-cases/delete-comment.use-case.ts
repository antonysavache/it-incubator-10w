import {CommentsCommandRepository} from "../../infrastructure/repositories/comments-command.repository";
import {CommentsQueryRepository} from "../../infrastructure/repositories/comments-query.repository";
import {Result} from "../../../../shared/infrastructures/result";

export class DeleteCommentUseCase {
    constructor(
        private commentsCommandRepository: CommentsCommandRepository,
        private commentsQueryRepository: CommentsQueryRepository
    ) {}

    async execute(id: string, userId: string): Promise<Result<void>> {
        const comment = await this.commentsQueryRepository.findById(id);

        if (!comment) {
            return Result.fail('Comment not found');
        }

        if (comment.userId !== userId) {
            return Result.fail('Forbidden');
        }

        const isDeleted = await this.commentsCommandRepository.delete(id);
        if (!isDeleted) {
            return Result.fail('Failed to delete comment');
        }

        return Result.ok();
    }
}