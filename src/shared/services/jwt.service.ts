// src/shared/services/jwt.service.ts
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { SETTINGS } from "../../configs/settings";

export interface JwtPayload {
    userId: string;
    login?: string; // Make login optional here too
    deviceId?: string;
    // Add other claims like issuedAt (iat), expirationTime (exp) if needed standardly
}

export class JwtService {
    static createJWT(
        userId: string,
        expiresIn: string,
        deviceId?: string,
        login?: string // Add optional login parameter
    ): string {
        const payload: JwtPayload = {
            userId,
            // Add login ONLY if it's provided and not empty
            ...(login && { login: login }),
            // Keep deviceId logic
            ...(deviceId && { deviceId: deviceId }),
        };

        // Remove deviceId from payload if it wasn't provided (for access tokens)
        if (!deviceId) {
            delete payload.deviceId;
        }


        return jwt.sign(
            payload,
            SETTINGS.JWT_SECRET,
            { expiresIn }
        );
    }

    // ... (verifyToken and extractPayload remain the same) ...
    static verifyToken(token: string): JwtPayload | null {
        try {
            // Ensure payload includes userId. Login is now optional in the token itself.
            const payload = jwt.verify(token, SETTINGS.JWT_SECRET) as JwtPayload;
            if (!payload || !payload.userId) { // Primarily check for userId existence
                console.error('Invalid token payload (missing userId):', payload);
                return null;
            }
            return payload;
        } catch (error) {
            // Проверка на причину ошибки
            if (error instanceof jwt.TokenExpiredError) {
                console.error('Token has expired:', error);
            } else if (error instanceof jwt.JsonWebTokenError) {
                console.error('Invalid token format:', error);
            } else {
                console.error('Token verification failed:', error);
            }
            // В любом случае возвращаем null
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