import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import courseShareController from "./courseShare.controller";
import { acceptShareParamsSchema } from "./courseShare.schemas";

const shareInviteRouter = Router();

shareInviteRouter.get(
    "/invites",
    authenticator("access"),
    asyncWrapper(courseShareController.getInvites),
);

shareInviteRouter.post(
    "/:shareId/accept",
    validator({
        params: acceptShareParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseShareController.acceptShare),
);

export default shareInviteRouter;
