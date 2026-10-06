import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import userController from "./user.controller";
import {
    createUserRequestSchema,
    getUsersRequestSchema,
    updateUserRequestSchema,
    userIdParamsSchema,
} from "./user.schemas";

const userRouter = Router();

userRouter.post(
    "/",
    validator({
        body: createUserRequestSchema,
    }),
    asyncWrapper(userController.createUser),
);

userRouter.get("/me", authenticator("access"), asyncWrapper(userController.getMe));

userRouter.get(
    "/:id",
    validator({
        params: userIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(userController.getUserById),
);

userRouter.get(
    "/",
    validator({
        query: getUsersRequestSchema,
    }),
    asyncWrapper(userController.getUsers),
);

userRouter.patch(
    "/",
    validator({
        body: updateUserRequestSchema,
    }),
    authenticator("access"),
    asyncWrapper(userController.updateUser),
);

userRouter.delete(
    "/",
    authenticator("access"),
    asyncWrapper(userController.deleteUser),
);

export default userRouter;
