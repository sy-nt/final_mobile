import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import homeworkController from "./homework.controller";
import {
    createHomeworkRequestSchema,
    deleteHomeworkParamsSchema,
    getHomeworkByIdParamsSchema,
    getHomeworksRequestSchema,
    updateHomeworkParamsSchema,
    updateHomeworkRequestSchema,
} from "./homework.schemas";

const homeworkRouter = Router();

homeworkRouter.post(
    "/",
    validator({
        body: createHomeworkRequestSchema,
    }),
    authenticator("access"),
    asyncWrapper(homeworkController.createHomework),
);

homeworkRouter.get(
    "/",
    validator({
        query: getHomeworksRequestSchema,
    }),
    authenticator("access"),
    asyncWrapper(homeworkController.getHomeworks),
);

homeworkRouter.get(
    "/:id",
    validator({
        params: getHomeworkByIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(homeworkController.getHomeworkById),
);

homeworkRouter.patch(
    "/:id",
    validator({
        body: updateHomeworkRequestSchema,
        params: updateHomeworkParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(homeworkController.updateHomework),
);

homeworkRouter.delete(
    "/:id",
    validator({
        params: deleteHomeworkParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(homeworkController.deleteHomework),
);

export default homeworkRouter;
