import {NextFunction, Request, Response} from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization

    if (!auth) {
        return res.sendStatus(401);
    }

    const [basic, token] = auth.split(' ')

    if (basic !== 'Basic') {
        return res.sendStatus(401);
    }

    const decodedData = Buffer.from(token, 'base64').toString();
    const [login, password] = decodedData.split(':');

    if (login !== 'admin' || password !== 'qwerty') {
        return res.sendStatus(401);
    }

    return next()
}