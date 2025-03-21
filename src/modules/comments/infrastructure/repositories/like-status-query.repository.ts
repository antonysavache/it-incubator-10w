import { BaseQueryRepository } from "../../../../shared/infrastructures/repositories/base-query.repository";
import { LikesInfo, LikeStatusEnum, LikeStatusModel } from "../../domain/interfaces/like-status.interface";

export class LikeStatusQueryRepository extends BaseQueryRepository<LikeStatusModel> {
    constructor() {
        super('commentLikeStatus');
    }

    async getLikesInfo(commentId: string, userId?: string): Promise<LikesInfo> {
        this.checkInit();

        const [likesCount, dislikesCount, userStatus] = await Promise.all([
            this.collection.countDocuments({ commentId, status: 'Like' }),
            this.collection.countDocuments({ commentId, status: 'Dislike' }),
            userId
                ? this.collection.findOne({ commentId, userId })
                : null
        ]);

        return {
            likesCount,
            dislikesCount,
            myStatus: userStatus ? userStatus.status : 'None'
        };
    }

    async getUserStatus(commentId: string, userId: string): Promise<LikeStatusEnum> {
        this.checkInit();

        const record = await this.collection.findOne({ commentId, userId });

        return record ? record.status : 'None';
    }
}