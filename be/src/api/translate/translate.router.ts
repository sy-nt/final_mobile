import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import translateController from "./translate.controller";
import { suggestTranslationRequestSchema } from "./translate.schemas";

const translateRouter = Router();

translateRouter.get(
    "/suggest",
    validator({
        query: suggestTranslationRequestSchema,
    }),
    authenticator("access"),
    asyncWrapper(translateController.suggestTranslation),
);

export default translateRouter;
