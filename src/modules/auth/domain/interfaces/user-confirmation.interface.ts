import { ObjectId } from 'mongodb';

export interface UserConfirmationModel {
    _id: ObjectId;
    userId: string;
    email: string;
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
}