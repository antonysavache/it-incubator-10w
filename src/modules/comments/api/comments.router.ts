// src/modules/comments/api/comments.router.ts
import { Router } from "express";
import { commentValidation } from "./comments-validation.middleware";
import { handleValidationErrors } from "../../../shared/infrastructures/middlewares/error-handler.middleware";
import { commentsController } from "../../../configs/compositions/comments.composition";
import { jwtAuthMiddleware } from "../../../shared/infrastructures/middlewares/jwt-auth.middleware";
import { likeStatusValidation } from "./like-status-validation.middleware";

export const commentsRouter = Router();

// Post-specific comment routes
commentsRouter.post('/posts/:postId/comments',
    jwtAuthMiddleware,
    commentValidation,
    handleValidationErrors,
    commentsController.createComment
);

commentsRouter.get('/posts/:postId/comments',
    commentsController.getComments
);

// Comment-specific routes
commentsRouter.put('/comments/:commentId',
    jwtAuthMiddleware,
    commentValidation,
    handleValidationErrors,
    commentsController.updateComment
);

commentsRouter.delete('/comments/:commentId',
    jwtAuthMiddleware,
    commentsController.deleteComment
);

commentsRouter.get('/comments/:commentId',
    commentsController.getComment
);

// New like status endpoint
commentsRouter.put('/comments/:commentId/like-status',
    jwtAuthMiddleware,
    likeStatusValidation,
    handleValidationErrors,
    commentsController.updateLikeStatus
);