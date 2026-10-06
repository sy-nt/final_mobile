import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import flashcardController from "./flashcard.controller";
import {
    bulkCreateFlashcardRequestSchema,
    courseIdParamsSchema,
    createFlashcardRequestSchema,
    flashcardIdParamsSchema,
    updateFlashcardRequestSchema,
} from "./flashcard.schemas";

const flashcardRouter = Router({ mergeParams: true });

flashcardRouter.post(
    "/",
    validator({
        body: createFlashcardRequestSchema,
        params: courseIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(flashcardController.createFlashcard),
);

flashcardRouter.post(
    "/bulk",
    validator({
        body: bulkCreateFlashcardRequestSchema,
        params: courseIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(flashcardController.bulkCreateFlashcards),
);

flashcardRouter.get(
    "/",
    validator({
        params: courseIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(flashcardController.getFlashcards),
);

flashcardRouter.patch(
    "/:id",
    validator({
        body: updateFlashcardRequestSchema,
        params: flashcardIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(flashcardController.updateFlashcard),
);

flashcardRouter.delete(
    "/:id",
    validator({
        params: flashcardIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(flashcardController.deleteFlashcard),
);

export default flashcardRouter;
