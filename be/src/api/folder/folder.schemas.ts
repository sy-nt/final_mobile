import { uuid } from "@shared/schema";
import Joi from "joi";

export const addFolderCourseRequestSchema = Joi.object({
    courseId: uuid.required(),
});

export const createFolderRequestSchema = Joi.object({
    name: Joi.string().max(255).required(),
});

export const folderIdParamsSchema = Joi.object({
    id: uuid.required(),
});

export const removeFolderCourseParamsSchema = Joi.object({
    courseId: uuid.required(),
    id: uuid.required(),
});

export const updateFolderRequestSchema = Joi.object({
    name: Joi.string().max(255).required(),
});
