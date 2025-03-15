import {NextFunction, Response, Request} from "express";
import {validationResult} from "express-validator";

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsMessages = errors.array({ onlyFirstError: true }).map(error => ({
            message: error.msg,
            field: error.type === 'field' ? error.path : error.type
        }))

        return res.status(400).json({ errorsMessages: errorsMessages })
    }
    return next()
}