import {body, param} from "express-validator";
import {blogsQueryRepository} from "../../../configs/compositions/repositories";

export const blogIdValidation = [
    body('blogId')
        .optional()
        .trim()
        .notEmpty().withMessage('Blog ID is required')
        .isMongoId().withMessage('Invalid blogId')
        .custom(async (blogId) => {
            const blog = await blogsQueryRepository.findById(blogId);
            if (!blog) {
                throw new Error('Blog not found');
            }
        }).withMessage('Blog not found'),

    param('blogId')
        .optional()
        .trim()
        .notEmpty().withMessage('Blog ID is required')
        .isMongoId().withMessage('Invalid blogId')
        .custom(async (blogId) => {
            const blog = await blogsQueryRepository.findById(blogId);
            if (!blog) {
                throw new Error('Blog not found');
            }
        }).withMessage('Blog not found')
];