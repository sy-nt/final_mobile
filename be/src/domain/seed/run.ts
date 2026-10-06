import "reflect-metadata";
import config from "@config/index";
import {
    CourseEntity,
    CourseReportEntity,
    CourseShareEntity,
    CourseTagEntity,
    FlashcardEntity,
    FolderCourseEntity,
    FolderEntity,
    HomeworkAttemptAnswerEntity,
    HomeworkAttemptEntity,
    HomeworkEntity,
    TagEntity,
    UserEntity,
    UserStatEntity,
} from "@domain/entities";
import logger from "@shared/lib/logger";
import bcrypt from "bcrypt";
import { DataSource } from "typeorm";

import { SEED_PASSWORD, SEED_USERS } from "./content";
import { SeedContext } from "./context";
import { insertClones } from "./insertClones";
import { insertDecks } from "./insertDecks";
import { insertFolders } from "./insertFolders";
import { insertPractice } from "./insertPractice";
import { insertReports } from "./insertReports";
import { insertEmailShares, insertPublicShares } from "./insertShares";
import { insertStats } from "./insertStats";
import { insertTags } from "./insertTags";
import { insertUsers } from "./insertUsers";

const createDataSource = () => {
    return new DataSource({
        ...config.db.postgres,
        entities: [
            CourseEntity,
            CourseReportEntity,
            CourseShareEntity,
            CourseTagEntity,
            FlashcardEntity,
            FolderCourseEntity,
            FolderEntity,
            HomeworkAttemptAnswerEntity,
            HomeworkAttemptEntity,
            HomeworkEntity,
            TagEntity,
            UserEntity,
            UserStatEntity,
        ],
        synchronize: false,
        type: "postgres",
    });
};

const alreadySeeded = async (dataSource: DataSource) => {
    const count = await dataSource.getRepository(UserEntity).count({
        where: { email: SEED_USERS[0].email },
    });
    return count > 0;
};

const seedAll = async (ctx: SeedContext) => {
    await insertDecks(ctx);
    await insertPublicShares(ctx);
    await insertEmailShares(ctx);
    await insertClones(ctx);
    await insertFolders(ctx);
    await insertPractice(ctx);
    await insertStats(ctx);
    await insertReports(ctx);
};

const run = async () => {
    const dataSource = createDataSource();
    await dataSource.initialize();
    if (await alreadySeeded(dataSource)) {
        logger.info("Seed users already exist. Skipping.");
        await dataSource.destroy();
        return;
    }
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    await dataSource.transaction(async (manager) => {
        const users = await insertUsers(manager, passwordHash);
        const tags = await insertTags(manager);
        await seedAll({
            courses: new Map(),
            flashcards: new Map(),
            manager,
            tags,
            users,
        });
    });
    logger.info(
        `Seeded ${SEED_USERS.length} users. Password for all: ${SEED_PASSWORD}`,
    );
    await dataSource.destroy();
};

run().catch(async (error: unknown) => {
    logger.error(error instanceof Error ? error.stack! : String(error));
    process.exitCode = 1;
});
