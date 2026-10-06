import { UserStatEntity } from "@domain/entities";

import { SeedContext } from "./context";

const saveStat = async (
    ctx: SeedContext,
    email: string,
    currentStreak: number,
    longestStreak: number,
    totalAttemptsCompleted: number,
    totalCorrectAnswers: number,
) => {
    const repo = ctx.manager.getRepository(UserStatEntity);
    await repo.save(
        repo.create({
            currentStreak,
            lastActivityDate: new Date(),
            longestStreak,
            totalAttemptsCompleted,
            totalCorrectAnswers,
            totalPoints: totalCorrectAnswers * 10,
            userId: ctx.users.get(email)!.id,
        }),
    );
};

export const insertStats = async (ctx: SeedContext) => {
    await saveStat(ctx, "ada.nguyen@inkdeck.seed", 3, 5, 4, 14);
    await saveStat(ctx, "linh.pham@inkdeck.seed", 1, 2, 1, 6);
    await saveStat(ctx, "huy.le@inkdeck.seed", 2, 2, 2, 7);
    await saveStat(ctx, "mai.vo@inkdeck.seed", 0, 1, 1, 3);
    await saveStat(ctx, "an.do@inkdeck.seed", 4, 4, 5, 18);
    await saveStat(ctx, "ha.dang@inkdeck.seed", 1, 1, 1, 5);
};
