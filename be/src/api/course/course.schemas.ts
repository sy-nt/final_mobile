import { CourseVisibility } from "@domain/entities";
import { limit, sort, uuid } from "@shared/schema";
import Joi from "joi";

export const courseIdParamsSchema = Joi.object({
    id: uuid.required(),
});

export const createCourseRequestSchema = Joi.object({
    description: Joi.string().max(1000).optional(),
    title: Joi.string().max(255).required(),
});

export const getCourseGalleryRequestSchema = Joi.object({
    lastId: uuid.optional(),
    limit,
    orderBy: Joi.string()
        .valid("cloneCount", "createdAt")
        .default("createdAt"),
    sort,
    tag: Joi.string().optional(),
    title: Joi.string().optional(),
});

export const getCoursesRequestSchema = Joi.object({
    folderId: uuid.optional(),
    lastId: uuid.optional(),
    limit,
    orderBy: Joi.string().valid("title", "createdAt").default("createdAt"),
    sort,
});

export const updateCourseRequestSchema = Joi.object({
    description: Joi.string().max(1000).optional(),
    title: Joi.string().max(255).optional(),
    visibility: Joi.string()
        .valid(...Object.values(CourseVisibility))
        .optional(),
}).min(1);
