import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";
import { SETTINGS } from "../../../configs/settings";

export const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const auth = req.headers.authorization;

        if (!auth) {
            return res.sendStatus(401);
        }

        const [bearer, token] = auth.split(' ');

        if (bearer !== 'Bearer' || !token) {
            return res.sendStatus(401);
        }

        let payload: any;
        try {
            payload = jwt.verify(token, SETTINGS.JWT_SECRET);
        } catch (err) {
            console.error('JWT verification failed:', err);
            return res.sendStatus(401);
        }

        if (!payload || typeof payload !== 'object' || !payload.userId) {
            console.error('Invalid JWT payload structure:', payload);
            return res.sendStatus(401);
        }

        // Ensure user object has all required properties with defaults if missing
        req['user'] = {
            id: payload.userId,
            login: payload.login || 'unknown'
        };

        return next();
    } catch (error) {
        console.error('Unexpected error in JWT middleware:', error);
        return res.sendStatus(500);
    }
}