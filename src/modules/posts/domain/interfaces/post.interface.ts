import { ObjectId } from 'mongodb';
import { LikeStatusEnum } from '../../../comments/domain/interfaces/like-status.interface';

export interface PostCreateDTO {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
}

export interface PostLikesInfo {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatusEnum;
    newestLikes: NewestLike[];
}

export interface NewestLike {
    addedAt: string;
    userId: string;
    login: string;
}

export interface PostDatabaseModel {
    _id: ObjectId;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
    extendedLikesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: LikeStatusEnum;
        newestLikes: NewestLike[];
    };
}

export interface PostViewModel {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
    extendedLikesInfo: PostLikesInfo;
}