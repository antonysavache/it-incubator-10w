import jwt from 'jsonwebtoken';
import { SETTINGS } from "../../configs/settings";
import { v4 as uuidv4 } from 'uuid';

export interface JwtPayload {
    userId: string;
    deviceId?: string;
}

export class JwtService {
    static createJWT(userId: string, expiresIn: string, deviceId?: string): string {
        return jwt.sign(
            { userId, deviceId: deviceId || uuidv4() },
            SETTINGS.JWT_SECRET,
            { expiresIn }
        );
    }

    static verifyToken(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, SETTINGS.JWT_SECRET) as JwtPayload;
        } catch (error) {
            return null;
        }
    }

    static extractPayload(token: string): JwtPayload | null {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const payload = Buffer.from(parts[1], 'base64').toString();
            return JSON.parse(payload);
        } catch (error) {
            return null;
        }
    }
}