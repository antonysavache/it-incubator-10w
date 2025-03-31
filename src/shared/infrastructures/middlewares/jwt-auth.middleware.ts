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

        try {
            const payload = jwt.verify(token, SETTINGS.JWT_SECRET) as any;

            if (!payload || !payload.userId) {
                console.error('Invalid token payload:', payload);
                return res.sendStatus(401);
            }

            // Make sure user has both id and login
            req.user = {
                id: payload.userId,
                login: payload.login || payload.userId // Fallback to userId if login is missing
            };

            console.log(`JWT auth set user: ${req.user.id} (${req.user.login})`);
            return next();
        } catch (err) {
            console.error('JWT verification failed:', err);
            return res.sendStatus(401);
        }
    } catch (error) {
        console.error('Unexpected error in JWT middleware:', error);
        return res.sendStatus(500);
    }
};