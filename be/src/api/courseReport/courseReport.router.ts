import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import courseReportController from "./courseReport.controller";
import {
    courseIdParamsSchema,
    createCourseReportRequestSchema,
} from "./courseReport.schemas";

const courseReportRouter = Router({ mergeParams: true });

courseReportRouter.post(
    "/",
    validator({
        body: createCourseReportRequestSchema,
        params: courseIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseReportController.createReport),
);

export default courseReportRouter;
