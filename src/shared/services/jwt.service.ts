import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import {SETTINGS} from "../../configs/settings";

export interface JwtPayload {
    userId: string;
    login?: string;
    deviceId?: string;
}

export class JwtService {
    static createJWT(userId: string, expiresIn: string, deviceId?: string): string {
        return jwt.sign(
            {
                userId,
                login: userId, // Use userId as login for simplicity
                deviceId: deviceId || uuidv4()
            },
            SETTINGS.JWT_SECRET,
            { expiresIn }
        );
    }

    static verifyToken(token: string): JwtPayload | null {
        try {
            const payload = jwt.verify(token, SETTINGS.JWT_SECRET) as JwtPayload;
            if (!payload || !payload.userId) {
                console.error('Invalid token payload:', payload);
                return null;
            }
            return payload;
        } catch (error) {
            console.error('Token verification failed:', error);
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
            console.error('Error extracting payload:', error);
            return null;
        }
    }
}