import Joi from "joi";

export const loginRequestSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
});
