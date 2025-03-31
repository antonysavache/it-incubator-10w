import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";
import { SETTINGS } from "../../../configs/settings";
import { RequestWithUser } from "../../types/express";

export const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;

    if (!auth) {
        return res.sendStatus(401);
    }

    const [bearer, token] = auth.split(' ');

    if (bearer !== 'Bearer' || !token) {
        return res.sendStatus(401);
    }

    try {
        const payload = jwt.verify(token, SETTINGS.JWT_SECRET) as { userId: string, login?: string };

        if (!payload || !payload.userId) {
            console.error('JWT payload invalid:', payload);
            return res.sendStatus(401);
        }

        // Set user info directly on req.user AND extend the Request object
        req['user'] = {
            id: payload.userId,
            login: payload.login || ''
        };

        // Also set it on req to ensure it's accessible
        (req as any).user = {
            id: payload.userId,
            login: payload.login || ''
        };

        console.log('JWT auth middleware set user:', req['user']);

        return next();
    } catch (e) {
        console.error('JWT auth middleware error:', e);
        return res.sendStatus(401);
    }
};