// src/shared/infrastructures/middlewares/jwt-auth.middleware.ts
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";
import { SETTINGS } from "../../../configs/settings";
import {JwtPayload, JwtService} from '../../services/jwt.service'; // Import payload type if defined

export const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) return res.sendStatus(401);

        const [bearer, token] = auth.split(' ');
        if (bearer !== 'Bearer' || !token) return res.sendStatus(401);

        try {
            const payload = JwtService.verifyToken(token); // Use your verify method

            // Strict check: require both userId and login in the token now
            if (!payload || !payload.userId || !payload.login) {
                console.error('Invalid token payload (missing userId or login):', payload);
                return res.sendStatus(401);
            }

            // Attach user object with guaranteed login
            req.user = {
                id: payload.userId,
                login: payload.login
            };

            console.log(`JWT auth set user: <span class="math-inline">\{req\.user\.id\} \(</span>{req.user.login})`);
            return next();

        } catch (err) { // Catch errors from verifyToken specifically
            console.error('JWT verification failed:', err);
            return res.sendStatus(401);
        }
    } catch (error) {
        console.error('Unexpected error in JWT middleware:', error);
        return res.sendStatus(500);
    }
};