import { ReportReason, ReportStatus } from "@domain/entities";
import { limit, sort, uuid } from "@shared/schema";
import Joi from "joi";

export const courseIdParamsSchema = Joi.object({
    courseId: uuid.required(),
});

export const createCourseReportRequestSchema = Joi.object({
    detail: Joi.string().max(1000).optional(),
    reason: Joi.string()
        .valid(...Object.values(ReportReason))
        .required(),
});

export const getReportsRequestSchema = Joi.object({
    lastId: uuid.optional(),
    limit,
    orderBy: Joi.string().valid("createdAt").default("createdAt"),
    sort,
    status: Joi.string()
        .valid(...Object.values(ReportStatus))
        .optional(),
});

export const reportIdParamsSchema = Joi.object({
    id: uuid.required(),
});

export const updateReportRequestSchema = Joi.object({
    note: Joi.string().max(1000).optional(),
    status: Joi.string()
        .valid(...Object.values(ReportStatus))
        .required(),
});
