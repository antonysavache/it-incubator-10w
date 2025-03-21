import { ObjectId } from 'mongodb';

export type LikeStatusEnum = 'None' | 'Like' | 'Dislike';

export interface LikeStatusModel {
    _id: ObjectId;
    userId: string;
    commentId: string;
    status: LikeStatusEnum;
    createdAt: string;
    updatedAt: string;
}

export interface LikeStatusCreateModel {
    userId: string;
    commentId: string;
    status: LikeStatusEnum;
}

export interface LikeStatusUpdateDTO {
    likeStatus: LikeStatusEnum;
}

export interface LikesInfo {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatusEnum;
}