import { Router } from 'express';
import {authMiddleware} from "../../../shared/infrastructures/middlewares/auth.middleware";
import {postsController} from "../../../configs/compositions/posts.composition";
import {handleValidationErrors} from "../../../shared/infrastructures/middlewares/error-handler.middleware";
import {postsValidation} from "./posts-validation.middleware";
import {blogIdValidation} from "./blog-id-validation.middleware";


export const postsRouter = Router();

postsRouter.get('/', postsController.getPosts);
postsRouter.post('/',
    authMiddleware,
    postsValidation,
    blogIdValidation,
    handleValidationErrors,
    postsController.createPost
);
postsRouter.get('/:id', postsController.getPostById);
postsRouter.put('/:id',
    authMiddleware,
    postsValidation,
    blogIdValidation,
    handleValidationErrors,
    postsController.updatePost
);
postsRouter.delete('/:id',
    authMiddleware,
    postsController.deletePost
);