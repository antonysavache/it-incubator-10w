import { Router } from 'express';
import { authMiddleware } from "../../../shared/infrastructures/middlewares/auth.middleware";
import { blogsController } from "../../../configs/compositions/blogs.composition";
import { handleValidationErrors } from "../../../shared/infrastructures/middlewares/error-handler.middleware";
import { postsValidation } from "../../posts/api/posts-validation.middleware";
import { blogsValidation } from "./blogs-validation.middleware";

export const blogsRouter = Router();

blogsRouter.get('/', blogsController.getBlogs);
blogsRouter.post('/',
    authMiddleware,
    blogsValidation,
    handleValidationErrors,
    blogsController.createBlog
);
blogsRouter.get('/:id', blogsController.getBlogById);
blogsRouter.put('/:id',
    authMiddleware,
    blogsValidation,
    handleValidationErrors,
    blogsController.updateBlog
);
blogsRouter.delete('/:id',
    authMiddleware,
    blogsController.deleteBlog
);

blogsRouter.get('/:id/posts', blogsController.getBlogPosts);
blogsRouter.post('/:id/posts',
    authMiddleware,
    postsValidation,
    handleValidationErrors,
    blogsController.createBlogPost
);