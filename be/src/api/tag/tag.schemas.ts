import { uuid } from "@shared/schema";
import Joi from "joi";

export const attachTagRequestSchema = Joi.object({
    name: Joi.string().max(100).required(),
});

export const courseIdParamsSchema = Joi.object({
    courseId: uuid.required(),
});

export const detachTagParamsSchema = Joi.object({
    courseId: uuid.required(),
    tagId: uuid.required(),
});

export const getTagsRequestSchema = Joi.object({
    search: Joi.string().optional(),
});
