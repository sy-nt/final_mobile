import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import courseShareController from "./courseShare.controller";
import {
    courseIdParamsSchema,
    createCourseShareRequestSchema,
    deleteCourseShareParamsSchema,
} from "./courseShare.schemas";

const courseShareRouter = Router({ mergeParams: true });

courseShareRouter.post(
    "/",
    validator({
        body: createCourseShareRequestSchema,
        params: courseIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseShareController.createShare),
);

courseShareRouter.get(
    "/",
    validator({
        params: courseIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseShareController.getShares),
);

courseShareRouter.delete(
    "/:shareId",
    validator({
        params: deleteCourseShareParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseShareController.revokeShare),
);

export default courseShareRouter;
