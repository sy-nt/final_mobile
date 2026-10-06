import * as dotenv from "dotenv";
import joi from "joi";

import type { Config } from "./type";

dotenv.config();

const envSchema = joi.object<Config>({
    auth: joi.object({
        jwt: joi.object({
            accessTokenExpiresIn: joi.string().default("1h"),
            accessTokenSecretKey: joi.string().required(),
            refreshTokenExpiresIn: joi.string().default("7d"),
            refreshTokenSecretKey: joi.string().required(),
        }),
    }),
    db: joi.object({
        postgres: joi.object({
            database: joi.string().required(),
            host: joi.string().required(),
            password: joi.string().required(),
            port: joi.number().required(),
            username: joi.string().required(),
        }),
        redis: joi.object({
            db: joi.number().required(),
            host: joi.string().required(),
            password: joi.string().default(""),
            port: joi.number().required(),
            username: joi.string().default(""),
        }),
    }),
    googleTranslateApiKey: joi.string().optional(),
    nodeEnv: joi.string().valid("DEV", "STAG", "PROD").default("DEV"),
    port: joi.number().default(3000),
});

const initConfig = () => {
    const validated = envSchema.validate(
        {
            auth: {
                jwt: {
                    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
                    accessTokenSecretKey: process.env.ACCESS_TOKEN_SECRET_KEY,
                    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
                    refreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY,
                },
            },
            db: {
                postgres: {
                    database: process.env.POSTGRES_DATABASE,
                    host: process.env.POSTGRES_HOST,
                    password: process.env.POSTGRES_PASSWORD,
                    port: process.env.POSTGRES_PORT,
                    username: process.env.POSTGRES_USERNAME,
                },
                redis: {
                    db: process.env.REDIS_DB,
                    host: process.env.REDIS_HOST,
                    password: process.env.REDIS_PASSWORD,
                    port: process.env.REDIS_PORT,
                    username: process.env.REDIS_USERNAME,
                },
            },
            googleTranslateApiKey: process.env.GOOGLE_TRANSLATE_API_KEY,
            nodeEnv: process.env.NODE_ENV,
            port: process.env.PORT,
        },
        {
            abortEarly: false,
            convert: true,
        },
    );
    if (validated.error) {
        throw new Error(
            `Invalid environment variables: ${validated.error.message}`,
        );
    }
    return validated.value;
};

const config = initConfig();
export default config;
