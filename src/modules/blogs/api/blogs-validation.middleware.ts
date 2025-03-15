import {body, param} from 'express-validator'

export const blogsValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 15 }).withMessage('Name should not exceed 15 characters'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 500 }).withMessage('Description should not exceed 500 characters'),

    body('websiteUrl')
        .trim()
        .notEmpty().withMessage('Website URL is required')
        .isLength({ max: 100 }).withMessage('Website URL should not exceed 100 characters')
        .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
        .withMessage('Website URL should be valid URL format')
]
