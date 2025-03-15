import { ObjectId } from 'mongodb';

export interface PostCreateDTO {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
}

export interface PostDatabaseModel {
    _id: ObjectId;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
}

export interface PostViewModel {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
}