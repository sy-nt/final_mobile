import {
    CourseShareEntity,
    ShareStatus,
    ShareType,
} from "@domain/entities";

import { SEED_DECKS } from "./content";
import { SeedContext } from "./context";

export const insertPublicShares = async (ctx: SeedContext) => {
    const repo = ctx.manager.getRepository(CourseShareEntity);
    for (const deck of SEED_DECKS.filter((item) => item.public)) {
        const course = ctx.courses.get(deck.title)!;
        const owner = ctx.users.get(deck.ownerEmail)!;
        await repo.save(
            repo.create({
                courseId: course.id,
                sharedByUserId: owner.id,
                shareType: ShareType.ALL,
                status: ShareStatus.ACTIVE,
            }),
        );
    }
};

export const insertEmailShares = async (ctx: SeedContext) => {
    const repo = ctx.manager.getRepository(CourseShareEntity);
    const school = ctx.courses.get("School Supplies")!;
    const verbs = ctx.courses.get("Action Verbs")!;
    await repo.save(
        repo.create({
            courseId: school.id,
            sharedByUserId: ctx.users.get("khoa.bui@inkdeck.seed")!.id,
            sharedWithEmail: "an.do@inkdeck.seed",
            shareType: ShareType.EMAIL,
            status: ShareStatus.ACTIVE,
        }),
    );
    await repo.save(
        repo.create({
            courseId: verbs.id,
            sharedByUserId: ctx.users.get("mai.vo@inkdeck.seed")!.id,
            sharedWithEmail: "trang.ho@inkdeck.seed",
            shareType: ShareType.EMAIL,
            status: ShareStatus.ACTIVE,
        }),
    );
};
