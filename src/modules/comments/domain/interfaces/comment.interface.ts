import { ObjectId } from "mongodb";
import { LikesInfo } from "./like-status.interface";

export interface CommentCreateDTO {
    content: string;
}

export interface CommentViewModel {
    id: string;
    content: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    };
    createdAt: string;
    likesInfo: LikesInfo;
}

export interface CommentDatabaseModel {
    _id: ObjectId;
    postId: string;
    content: string;
    userId: string;
    userLogin: string;
    createdAt: string;
}

export interface CommentFullViewModel extends CommentViewModel {
    postId: string;
    userId: string;
    userLogin: string;
}