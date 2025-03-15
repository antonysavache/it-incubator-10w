import jwt from 'jsonwebtoken';
import {NextFunction, Request,Response} from "express";
import {SETTINGS} from "../../../configs/settings";
import {RequestWithUser} from "../../types/express";

export const jwtAuthMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;

    if (!auth) {
        return res.sendStatus(401);
    }

    const [bearer, token] = auth.split(' ');

    if (bearer !== 'Bearer' || !token) {
        return res.sendStatus(401);
    }

    try {
        const payload = jwt.verify(token, SETTINGS.JWT_SECRET) as { userId: string, userLogin: string };

        req.user = {
            id: payload.userId,
            login: payload.userLogin
        };

        return next();
    } catch (e) {
        return res.sendStatus(401);
    }
};