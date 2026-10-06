import { HomeworkDirection, HomeworkType } from "@domain/entities";
import { uuid } from "@shared/schema";
import Joi from "joi";

export const createHomeworkRequestSchema = Joi.object({
    courseId: uuid.required(),
    direction: Joi.string()
        .valid(...Object.values(HomeworkDirection))
        .optional(),
    questionCount: Joi.number().integer().min(1).optional(),
    title: Joi.string().max(255).optional(),
    type: Joi.string()
        .valid(...Object.values(HomeworkType))
        .required(),
});

export const deleteHomeworkParamsSchema = Joi.object({
    id: uuid.required(),
});

export const getHomeworkByIdParamsSchema = Joi.object({
    id: uuid.required(),
});

export const getHomeworksRequestSchema = Joi.object({
    courseId: uuid.optional(),
});

export const updateHomeworkParamsSchema = Joi.object({
    id: uuid.required(),
});

export const updateHomeworkRequestSchema = Joi.object({
    direction: Joi.string()
        .valid(...Object.values(HomeworkDirection))
        .optional(),
    questionCount: Joi.number().integer().min(1).optional(),
    title: Joi.string().max(255).optional(),
});
