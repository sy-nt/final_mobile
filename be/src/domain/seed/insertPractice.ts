import {
    AttemptStatus,
    HomeworkAttemptAnswerEntity,
    HomeworkAttemptEntity,
    HomeworkDirection,
    HomeworkEntity,
    HomeworkType,
} from "@domain/entities";

import { SeedContext } from "./context";

const addHomework = async (
    ctx: SeedContext,
    ownerEmail: string,
    courseTitle: string,
    title: string,
    type: HomeworkType,
    direction: HomeworkDirection,
    questionCount: number,
) => {
    const repo = ctx.manager.getRepository(HomeworkEntity);
    return repo.save(
        repo.create({
            courseId: ctx.courses.get(courseTitle)!.id,
            direction,
            questionCount,
            title,
            type,
            userId: ctx.users.get(ownerEmail)!.id,
        }),
    );
};

const completeAttempt = async (
    ctx: SeedContext,
    homework: HomeworkEntity,
    userEmail: string,
    courseTitle: string,
    correct: boolean[],
) => {
    const attemptRepo = ctx.manager.getRepository(HomeworkAttemptEntity);
    const answerRepo = ctx.manager.getRepository(HomeworkAttemptAnswerEntity);
    const cards = ctx.flashcards.get(courseTitle) ?? [];
    const startedAt = new Date(Date.now() - 20 * 60 * 1000);
    const completedAt = new Date();
    const correctCount = correct.filter(Boolean).length;
    const attempt = await attemptRepo.save(
        attemptRepo.create({
            completedAt,
            correctCount,
            homeworkId: homework.id,
            score: Math.round((correctCount / correct.length) * 10000) / 100,
            startedAt,
            status: AttemptStatus.COMPLETED,
            totalQuestions: correct.length,
            userId: ctx.users.get(userEmail)!.id,
        }),
    );
    for (const [index, isCorrect] of correct.entries()) {
        const card = cards[index];
        await answerRepo.save(
            answerRepo.create({
                attemptId: attempt.id,
                flashcardId: card?.id,
                isCorrect,
                questionDirection: HomeworkDirection.EN_TO_VI,
                userAnswer: isCorrect ? (card?.wordVi ?? "") : "???",
            }),
        );
    }
};

export const insertPractice = async (ctx: SeedContext) => {
    const greetings = await addHomework(
        ctx,
        "ada.nguyen@inkdeck.seed",
        "Everyday Greetings",
        "Warm-up greetings",
        HomeworkType.MULTIPLE_CHOICE,
        HomeworkDirection.EN_TO_VI,
        5,
    );
    await completeAttempt(ctx, greetings, "ada.nguyen@inkdeck.seed", "Everyday Greetings", [
        true,
        true,
        true,
        false,
        true,
    ]);
    const animals = await addHomework(
        ctx,
        "huy.le@inkdeck.seed",
        "Farm Animals",
        "Name the animals",
        HomeworkType.WRITE_WORD,
        HomeworkDirection.VI_TO_EN,
        4,
    );
    await completeAttempt(ctx, animals, "huy.le@inkdeck.seed", "Farm Animals", [
        true,
        true,
        false,
        true,
    ]);
    await addHomework(
        ctx,
        "mai.vo@inkdeck.seed",
        "Action Verbs",
        "Verb drill",
        HomeworkType.MULTIPLE_CHOICE,
        HomeworkDirection.MIXED,
        6,
    );
};
