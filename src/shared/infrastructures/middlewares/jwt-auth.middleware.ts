// src/shared/infrastructures/middlewares/jwt-auth.middleware.ts
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";
import { SETTINGS } from "../../../configs/settings";
import {JwtPayload, JwtService} from '../../services/jwt.service'; // Import payload type if defined

export const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) {
            console.log('No authorization header');
            return res.sendStatus(401);
        }

        const [bearer, token] = auth.split(' ');
        if (bearer !== 'Bearer' || !token) {
            console.log('Invalid authorization format');
            return res.sendStatus(401);
        }

        // Используем verifyToken, который обрабатывает все ошибки включая истечение срока
        const payload = JwtService.verifyToken(token);
        
        // Если верификация не прошла успешно - возвращаем 401
        if (!payload) {
            console.log('Token verification failed');
            return res.sendStatus(401);
        }
        
        // Строгая проверка наличия userId и login
        if (!payload.userId || !payload.login) {
            console.error('Invalid token payload (missing userId or login):', payload);
            return res.sendStatus(401);
        }

        // Прикрепляем пользователя к запросу
        req.user = {
            id: payload.userId,
            login: payload.login
        };

        console.log(`JWT auth set user: ${req.user.id} (${req.user.login})`);
        return next();
    } catch (error) {
        console.error('Unexpected error in JWT middleware:', error);
        return res.sendStatus(500);
    }
};