import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import tagController from "./tag.controller";
import {
    attachTagRequestSchema,
    courseIdParamsSchema,
    detachTagParamsSchema,
} from "./tag.schemas";

const courseTagRouter = Router({ mergeParams: true });

courseTagRouter.get(
    "/",
    validator({
        params: courseIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(tagController.getCourseTags),
);

courseTagRouter.post(
    "/",
    validator({
        body: attachTagRequestSchema,
        params: courseIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(tagController.attachTag),
);

courseTagRouter.delete(
    "/:tagId",
    validator({
        params: detachTagParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(tagController.detachTag),
);

export default courseTagRouter;
