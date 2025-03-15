import {body} from "express-validator";

export const commentValidation = [
    body('content')
        .trim()
        .notEmpty().withMessage('Content is required')
        .isLength({ max: 300 }).withMessage('Content should not exceed 300 characters')
];