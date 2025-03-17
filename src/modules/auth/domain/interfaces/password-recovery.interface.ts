import { ObjectId } from 'mongodb';

export interface PasswordRecoveryModel {
    _id: ObjectId;
    userId: string;
    email: string;
    recoveryCode: string;
    expirationDate: Date;
    isUsed: boolean;
}

export interface PasswordRecoveryRequestDTO {
    email: string;
}

export interface PasswordRecoveryConfirmDTO {
    newPassword: string;
    recoveryCode: string;
}