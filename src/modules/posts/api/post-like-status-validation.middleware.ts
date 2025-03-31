import { body } from "express-validator";

export const postLikeStatusValidation = [
    body('likeStatus')
        .trim()
        .notEmpty().withMessage('Like status is required')
        .isIn(['None', 'Like', 'Dislike']).withMessage("Like status should be one of: 'None', 'Like', 'Dislike'")
];