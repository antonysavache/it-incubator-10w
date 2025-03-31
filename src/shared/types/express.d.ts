declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                login: string;
                deviceId?: string;
            }
        }
    }
}

export interface RequestWithUser<P = {}, B = {}> extends Request<P, any, B> {
    user?: {
        id: string;
        login: string;
        deviceId?: string;
    }
}