import { ObjectId } from 'mongodb';

export interface BlogCreateDTO {
    name: string;
    description: string;
    websiteUrl: string;
}

export interface BlogViewModel {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;
}

export interface BlogDatabaseModel {
    _id: ObjectId;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;
}