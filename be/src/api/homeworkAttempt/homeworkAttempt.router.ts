import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import homeworkAttemptController from "./homeworkAttempt.controller";
import {
    attemptIdParamsSchema,
    getAttemptsRequestSchema,
    homeworkIdParamsSchema,
    submitAnswerRequestSchema,
} from "./homeworkAttempt.schemas";

const homeworkAttemptRouter = Router({ mergeParams: true });

homeworkAttemptRouter.post(
    "/",
    validator({
        params: homeworkIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(homeworkAttemptController.startAttempt),
);

homeworkAttemptRouter.get(
    "/",
    validator({
        params: homeworkIdParamsSchema,
        query: getAttemptsRequestSchema,
    }),
    authenticator("access"),
    asyncWrapper(homeworkAttemptController.getAttempts),
);

homeworkAttemptRouter.get(
    "/:attemptId",
    validator({
        params: attemptIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(homeworkAttemptController.getAttemptById),
);

homeworkAttemptRouter.post(
    "/:attemptId/answers",
    validator({
        body: submitAnswerRequestSchema,
        params: attemptIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(homeworkAttemptController.submitAnswer),
);

homeworkAttemptRouter.post(
    "/:attemptId/complete",
    validator({
        params: attemptIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(homeworkAttemptController.completeAttempt),
);

export default homeworkAttemptRouter;
