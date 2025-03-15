import express from "express";
import { SETTINGS } from "./configs/settings";
import { usersRouter } from "./modules/users/api/users.router";
import { authRouter } from "./modules/auth/api/auth.router";
import { testingRouter } from "./modules/testing/application/api/testing.router";
import { blogsRouter } from "./modules/blogs/api/blogs.router";
import { postsRouter } from "./modules/posts/api/posts.router";
import {commentsRouter} from "./modules/comments/api/comments.router";
import cookieParser from 'cookie-parser';
import {securityDevicesRouter} from "./modules/auth/api/security-devices.router";


export const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.AUTH, authRouter);
app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use('/', commentsRouter);
app.use(SETTINGS.PATH.TESTING, testingRouter);
app.use(SETTINGS.PATH.SECURITY_DEVICES, securityDevicesRouter);
