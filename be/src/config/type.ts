import type { StringValue } from "ms";

import { NodeEnv } from "@shared/types";

export interface AuthConfig {
    jwt: {
        accessTokenExpiresIn: StringValue;
        accessTokenSecretKey: string;
        refreshTokenExpiresIn: StringValue;
        refreshTokenSecretKey: string;
    };
}

export interface Config {
    auth: AuthConfig;
    db: {
        postgres: PostgresConfig;
        redis: RedisConfig;
    };
    googleTranslateApiKey?: string;
    nodeEnv: NodeEnv;
    port: number;
}

export interface PostgresConfig {
    database: string;
    host: string;
    password: string;
    port: number;
    username: string;
}

export interface RedisConfig {
    db: number;
    host: string;
    password: string;
    port: number;
    username: string;
}
