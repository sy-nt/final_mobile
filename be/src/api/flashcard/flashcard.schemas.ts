import { uuid } from "@shared/schema";
import Joi from "joi";

const flashcardItemSchema = Joi.object({
    example: Joi.string().max(1000).optional(),
    wordEn: Joi.string().max(255).required(),
    wordVi: Joi.string().max(255).required(),
});

export const bulkCreateFlashcardRequestSchema = Joi.object({
    flashcards: Joi.array()
        .items(flashcardItemSchema)
        .min(1)
        .max(200)
        .required(),
});

export const courseIdParamsSchema = Joi.object({
    courseId: uuid.required(),
});

export const createFlashcardRequestSchema = flashcardItemSchema;

export const flashcardIdParamsSchema = Joi.object({
    courseId: uuid.required(),
    id: uuid.required(),
});

export const updateFlashcardRequestSchema = Joi.object({
    example: Joi.string().max(1000).optional(),
    position: Joi.number().integer().min(1).optional(),
    wordEn: Joi.string().max(255).optional(),
    wordVi: Joi.string().max(255).optional(),
}).min(1);
