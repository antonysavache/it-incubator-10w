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
            console.log(`[DEBUG] Updating like status for postId=<span class="math-inline">\{postId\}, userId\=</span>{userId}, status=${dto.likeStatus}`);

            // Check if post exists
            const post = await this.postsQueryRepository.findById(postId);
            if (!post) {
                console.log(`[DEBUG] Post not found: ${postId}`);
                return Result.fail('Post not found');
            }

            // Validate status value
            const validStatuses: LikeStatusEnum[] = ['None', 'Like', 'Dislike'];
            if (!dto.likeStatus || !validStatuses.includes(dto.likeStatus as LikeStatusEnum)) {
                console.log(`[DEBUG] Invalid likeStatus: ${dto.likeStatus}`);
                return Result.fail({
                    errorsMessages: [{
                        message: "Invalid like status. Should be 'None', 'Like', or 'Dislike'",
                        field: "likeStatus"
                    }]
                });
            }

            // Get current status
            const currentStatus = await this.postLikeStatusQueryRepository.getUserStatus(postId, userId);
            console.log(`[DEBUG] Current status: ${currentStatus}, new status: ${dto.likeStatus}`);

            // If no change, return success
            if (currentStatus === dto.likeStatus) {
                console.log(`[DEBUG] Status unchanged, returning success`);
                return Result.ok();
            }

            // Update status
            console.log(`[DEBUG] Attempting to update status in database`);
            const updated = await this.postLikeStatusCommandRepository.findAndUpdateStatus(
                userId,
                postId,
                userLogin,
                dto.likeStatus as LikeStatusEnum
            );

            if (!updated) {
                console.log(`[DEBUG] Failed to update like status in database`);
                return Result.fail({
                    errorsMessages: [{
                        message: "Error processing like status update",
                        field: "likeStatus"
                    }]
                });  // Changed this line
            }

            console.log(`[DEBUG] Successfully updated like status`);
            return Result.ok();

        } catch (error) {
            console.error(`[DEBUG] Exception in update like status: ${error}`);
            console.error(error.stack); // VERY IMPORTANT: Log the stack trace!

            return Result.fail({
                errorsMessages: [{
                    message: "Error processing like status update",
                    field: "likeStatus"
                }]
            }); // Changed this line
        }
    }
}