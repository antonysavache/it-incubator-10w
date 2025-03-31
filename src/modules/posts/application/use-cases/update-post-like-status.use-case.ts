import { Result } from "../../../../shared/infrastructures/result";
import { PostsQueryRepository } from "../../infrastructure/repositories/posts-query.repository";
import { PostLikeStatusCommandRepository } from "../../infrastructure/repositories/post-like-status-command.repository";
import { PostLikeStatusQueryRepository } from "../../infrastructure/repositories/post-like-status-query.repository";
import {LikeStatusEnum, LikeStatusUpdateDTO} from "../../../comments/domain/interfaces/like-status.interface";

export class UpdatePostLikeStatusUseCase {
    constructor(
        private postsQueryRepository: PostsQueryRepository,
        private postLikeStatusCommandRepository: PostLikeStatusCommandRepository,
        private postLikeStatusQueryRepository: PostLikeStatusQueryRepository
    ) {}

    async execute(
        postId: string,
        userId: string,
        userLogin: string,
        dto: LikeStatusUpdateDTO
    ): Promise<Result<void>> {
        try {
            console.log(`Execute post like status for postId=${postId}, userId=${userId}, status=${dto.likeStatus}`);

            // Check if post exists
            const post = await this.postsQueryRepository.findById(postId);
            if (!post) {
                console.log(`Post not found: ${postId}`);
                return Result.fail('Post not found');
            }

            // Validate status value
            const validStatuses: LikeStatusEnum[] = ['None', 'Like', 'Dislike'];
            if (!dto.likeStatus || !validStatuses.includes(dto.likeStatus as LikeStatusEnum)) {
                return Result.fail({
                    errorsMessages: [{
                        message: "Invalid like status. Should be 'None', 'Like', or 'Dislike'",
                        field: "likeStatus"
                    }]
                });
            }

            // Get current status
            const currentStatus = await this.postLikeStatusQueryRepository.getUserStatus(postId, userId);
            console.log(`Current status: ${currentStatus}, new status: ${dto.likeStatus}`);

            // If no change, return success
            if (currentStatus === dto.likeStatus) {
                return Result.ok();
            }

            // Update status
            const updated = await this.postLikeStatusCommandRepository.findAndUpdateStatus(
                userId,
                postId,
                userLogin,
                dto.likeStatus as LikeStatusEnum
            );

            if (!updated) {
                console.log(`Failed to update like status`);
                return Result.fail('Failed to update like status');
            }

            console.log(`Successfully updated like status`);
            return Result.ok();
        } catch (error) {
            console.error(`Exception in update like status: ${error}`);
            return Result.fail('Error processing like status update');
        }
    }
}