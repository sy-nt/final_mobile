import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { Router } from "express";

import userStatController from "./userStat.controller";

const userStatRouter = Router();

userStatRouter.get(
    "/",
    authenticator("access"),
    asyncWrapper(userStatController.getMyStats),
);

export default userStatRouter;
