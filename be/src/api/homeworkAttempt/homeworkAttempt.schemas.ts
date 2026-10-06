import { HomeworkDirection } from "@domain/entities";
import { limit, sort, uuid } from "@shared/schema";
import Joi from "joi";

export const attemptIdParamsSchema = Joi.object({
    attemptId: uuid.required(),
    homeworkId: uuid.required(),
});

export const getAttemptsRequestSchema = Joi.object({
    lastId: uuid.optional(),
    limit,
    orderBy: Joi.string().valid("startedAt").default("startedAt"),
    sort,
});

export const homeworkIdParamsSchema = Joi.object({
    homeworkId: uuid.required(),
});

export const submitAnswerRequestSchema = Joi.object({
    direction: Joi.string()
        .valid(HomeworkDirection.EN_TO_VI, HomeworkDirection.VI_TO_EN)
        .required(),
    flashcardId: uuid.required(),
    userAnswer: Joi.string().required(),
});
