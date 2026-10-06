import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import tagController from "./tag.controller";
import { getTagsRequestSchema } from "./tag.schemas";

const tagRouter = Router();

tagRouter.get(
    "/",
    validator({
        query: getTagsRequestSchema,
    }),
    authenticator("access"),
    asyncWrapper(tagController.getTags),
);

export default tagRouter;
