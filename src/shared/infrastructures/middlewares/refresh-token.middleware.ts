import { NextFunction, Response } from "express";
import { JwtService } from "../../services/jwt.service";
import { tokenQueryRepository } from "../../../configs/compositions/repositories";
import { RequestWithUser } from "../../types/express";

export const refreshTokenMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.sendStatus(401);
    }

    try {
        const payload = JwtService.verifyToken(refreshToken);

        if (!payload || !payload.userId) {
            return res.sendStatus(401);
        }

        const tokenDoc = await tokenQueryRepository.findValidToken(refreshToken, 'REFRESH');
        if (!tokenDoc) {
            return res.sendStatus(401);
        }

        req.user = {
            id: payload.userId,
            login: '',
            deviceId: payload.deviceId
        };

        return next();
    } catch (e) {
        console.error('Refresh token validation error:', e);
        return res.sendStatus(401);
    }
};