import Joi from "joi";

export const suggestTranslationRequestSchema = Joi.object({
    from: Joi.string().valid("en", "vi").required(),
    text: Joi.string().trim().min(1).required(),
});
