import { Request } from 'express';

export interface RequestWithUser<P = {}, B = {}> extends Request<P, any, B> {
    user: {
        id: string;
        login: string;
        deviceId?: string;
    }
}