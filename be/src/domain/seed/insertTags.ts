import { TagEntity } from "@domain/entities";
import { EntityManager } from "typeorm";

import { SEED_TAGS } from "./content";

export const insertTags = async (manager: EntityManager) => {
    const repo = manager.getRepository(TagEntity);
    const tags = new Map<string, TagEntity>();
    for (const name of SEED_TAGS) {
        const existing = await repo.findOne({ where: { name } });
        tags.set(name, existing ?? (await repo.save(repo.create({ name }))));
    }
    return tags;
};
