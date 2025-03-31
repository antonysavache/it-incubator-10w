import { ObjectId } from 'mongodb';
import { LikeStatusEnum } from '../../../comments/domain/interfaces/like-status.interface';

export interface PostLikeStatusModel {
    _id: ObjectId;
    userId: string;
    userLogin: string;
    postId: string;
    status: LikeStatusEnum;
    createdAt: string;
    updatedAt: string;
}

export interface PostLikeStatusCreateModel {
    userId: string;
    userLogin: string;
    postId: string;
    status: LikeStatusEnum;
}
