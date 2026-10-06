import { UserEntity } from "@domain/entities";
import { EntityManager } from "typeorm";

import { SEED_USERS } from "./content";

export const insertUsers = async (
    manager: EntityManager,
    passwordHash: string,
) => {
    const repo = manager.getRepository(UserEntity);
    const users = new Map<string, UserEntity>();
    for (const row of SEED_USERS) {
        const saved = await repo.save(
            repo.create({
                email: row.email,
                firstName: row.firstName,
                lastLoginAt: new Date(),
                lastName: row.lastName,
                password: passwordHash,
                role: row.role,
            }),
        );
        users.set(row.email, saved);
    }
    return users;
};
