import { Router } from "express";
import {authMiddleware} from "../../../shared/infrastructures/middlewares/auth.middleware";
import {usersController} from "../../../configs/compositions/users-composition";

export const usersRouter = Router();
usersRouter.use(authMiddleware);
usersRouter.get('/',
    usersController.getUsers
);

usersRouter.post('/',
    usersController.createUser
);

usersRouter.delete('/:id',
    usersController.deleteUser
)