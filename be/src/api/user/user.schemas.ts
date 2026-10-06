import { limit, page, sort } from "@shared/schema";
import Joi from "joi";

export const createUserRequestSchema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().trim().min(1).max(255).required(),
    lastName: Joi.string().trim().min(1).max(255).required(),
    password: Joi.string().required(),
});

export const getUsersRequestSchema = Joi.object({
    lastId: Joi.string().uuid().optional(),
    limit: limit,
    orderBy: Joi.string().valid("email", "createdAt").default("createdAt"),
    page: page,
    sort: sort,
});

export const userIdParamsSchema = Joi.object({
    id: Joi.string().uuid().required(),
});

export const updateUserRequestSchema = Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
}).min(1);
