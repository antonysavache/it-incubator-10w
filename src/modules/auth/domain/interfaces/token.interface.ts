import { ObjectId } from 'mongodb';

export interface TokenCreateModel {
    token: string;
    userId: string;
    issuedAt: Date;
    expiresAt: Date;
    isValid: boolean;
    tokenType: 'ACCESS' | 'REFRESH';
}

export interface TokenDatabaseModel {
    _id: ObjectId;
    token: string;
    userId: string;
    issuedAt: Date;
    expiresAt: Date;
    isValid: boolean;
    tokenType: 'ACCESS' | 'REFRESH';
}

export interface LoginSuccessViewModel {
    accessToken: string;
}

export interface MeViewModel {
    email: string;
    login: string;
    userId: string;
}

export const TOKEN_SETTINGS = {
    ACCESS_TOKEN_EXPIRATION: '1h',
    REFRESH_TOKEN_EXPIRATION: '24h',
    REFRESH_TOKEN_COOKIE: {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000
    }
};