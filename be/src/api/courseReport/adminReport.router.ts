import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import courseReportController from "./courseReport.controller";
import {
    getReportsRequestSchema,
    reportIdParamsSchema,
    updateReportRequestSchema,
} from "./courseReport.schemas";

const adminReportRouter = Router();

adminReportRouter.get(
    "/",
    validator({
        query: getReportsRequestSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseReportController.getReports),
);

adminReportRouter.patch(
    "/:id",
    validator({
        body: updateReportRequestSchema,
        params: reportIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseReportController.updateReport),
);

export default adminReportRouter;
