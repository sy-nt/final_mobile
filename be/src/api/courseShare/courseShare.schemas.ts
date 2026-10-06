import { ShareType } from "@domain/entities";
import { uuid } from "@shared/schema";
import Joi from "joi";

export const acceptShareParamsSchema = Joi.object({
    shareId: uuid.required(),
});

export const courseIdParamsSchema = Joi.object({
    courseId: uuid.required(),
});

export const createCourseShareRequestSchema = Joi.object({
    email: Joi.string()
        .email()
        .when("shareType", {
            is: ShareType.EMAIL,
            otherwise: Joi.forbidden(),
            then: Joi.required(),
        }),
    shareType: Joi.string()
        .valid(...Object.values(ShareType))
        .required(),
});

export const deleteCourseShareParamsSchema = Joi.object({
    courseId: uuid.required(),
    shareId: uuid.required(),
});
