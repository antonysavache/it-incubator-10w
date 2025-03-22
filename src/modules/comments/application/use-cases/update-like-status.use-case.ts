import { Result } from "../../../../shared/infrastructures/result";
import { CommentsQueryRepository } from "../../infrastructure/repositories/comments-query.repository";
import { LikeStatusCommandRepository } from "../../infrastructure/repositories/like-status-command.repository";
import { LikeStatusQueryRepository } from "../../infrastructure/repositories/like-status-query.repository";
import { LikeStatusEnum, LikeStatusUpdateDTO } from "../../domain/interfaces/like-status.interface";

export class UpdateLikeStatusUseCase {
    constructor(
        private commentsQueryRepository: CommentsQueryRepository,
        private likeStatusCommandRepository: LikeStatusCommandRepository,
        private likeStatusQueryRepository: LikeStatusQueryRepository
    ) {}

    async execute(
        commentId: string,
        userId: string,
        dto: LikeStatusUpdateDTO
    ): Promise<Result<void>> {
        console.log(`Executing like status update: commentId=${commentId}, userId=${userId}, status=${dto.likeStatus}`);

        const validStatuses: LikeStatusEnum[] = ['None', 'Like', 'Dislike'];
        if (!validStatuses.includes(dto.likeStatus as LikeStatusEnum)) {
            return Result.fail({
                errorsMessages: [{
                    message: "Invalid like status. Should be 'None', 'Like', or 'Dislike'",
                    field: "likeStatus"
                }]
            });
        }

        const comment = await this.commentsQueryRepository.findById(commentId);
        if (!comment) {
            return Result.fail('Comment not found');
        }

        const currentStatus = await this.likeStatusQueryRepository.getUserStatus(commentId, userId);
        console.log(`Current like status for userId=${userId} is ${currentStatus}`);

        if (currentStatus === dto.likeStatus) {
            // No need to update if status hasn't changed
            console.log(`Status unchanged, skipping update: ${currentStatus}`);
            return Result.ok();
        }

        const updated = await this.likeStatusCommandRepository.findAndUpdateStatus(
            userId,
            commentId,
            dto.likeStatus as LikeStatusEnum
        );

        if (!updated) {
            console.error(`Failed to update like status`);
            return Result.fail('Failed to update like status');
        }

        console.log(`Successfully updated like status to ${dto.likeStatus}`);
        return Result.ok();
    }
}