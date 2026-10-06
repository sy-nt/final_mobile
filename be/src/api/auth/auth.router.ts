import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import authController from "./auth.controller";
import { loginRequestSchema } from "./auth.schemas";

const authRouter = Router();

authRouter.post(
    "/login",
    validator({
        body: loginRequestSchema,
    }),
    asyncWrapper(authController.login),
);

authRouter.post(
    "/refresh",
    authenticator("refresh"),
    asyncWrapper(authController.refresh),
);

export default authRouter;
