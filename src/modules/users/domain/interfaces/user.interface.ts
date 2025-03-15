import { ObjectId } from 'mongodb';

export interface UserCreateDTO {
    login: string;
    email: string;
    password: string;
}

export interface UserViewModel {
    id: string;
    login: string;
    email: string;
    createdAt: string;
}

export interface UserDatabaseModel {
    _id: ObjectId;
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
}