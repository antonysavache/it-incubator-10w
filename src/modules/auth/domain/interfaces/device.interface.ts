import { ObjectId } from 'mongodb';

export interface DeviceCreateModel {
    deviceId: string;
    userId: string;
    ip: string;
    title: string; // User-Agent or default value
    lastActiveDate: Date;
    expiresAt: Date;
    isActive: boolean;
}

export interface DeviceDatabaseModel {
    _id: ObjectId;
    deviceId: string;
    userId: string;
    ip: string;
    title: string;
    lastActiveDate: Date;
    expiresAt: Date;
    isActive: boolean;
}

export interface DeviceViewModel {
    deviceId: string;
    ip: string;
    title: string;
    lastActiveDate: string;
}