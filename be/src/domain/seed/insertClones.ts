import { CourseEntity, CourseVisibility, FlashcardEntity } from "@domain/entities";

import { SeedContext } from "./context";

const cloneDeck = async (
    ctx: SeedContext,
    sourceTitle: string,
    ownerEmail: string,
    cloneTitle: string,
) => {
    const source = ctx.courses.get(sourceTitle)!;
    const owner = ctx.users.get(ownerEmail)!;
    const courseRepo = ctx.manager.getRepository(CourseEntity);
    const cardRepo = ctx.manager.getRepository(FlashcardEntity);
    const cloned = await courseRepo.save(
        courseRepo.create({
            description: source.description,
            isSuspended: false,
            ownerId: owner.id,
            sourceCourseId: source.id,
            title: source.title,
            visibility: CourseVisibility.PRIVATE,
        }),
    );
    ctx.courses.set(cloneTitle, cloned);
    const cards = ctx.flashcards.get(sourceTitle) ?? [];
    const copies: FlashcardEntity[] = [];
    for (const card of cards) {
        copies.push(
            await cardRepo.save(
                cardRepo.create({
                    courseId: cloned.id,
                    example: card.example,
                    position: card.position,
                    wordEn: card.wordEn,
                    wordVi: card.wordVi,
                }),
            ),
        );
    }
    ctx.flashcards.set(cloneTitle, copies);
    source.cloneCount += 1;
    await courseRepo.save(source);
};

export const insertClones = async (ctx: SeedContext) => {
    await cloneDeck(
        ctx,
        "Everyday Greetings",
        "an.do@inkdeck.seed",
        "Clone: Everyday Greetings",
    );
    await cloneDeck(
        ctx,
        "Farm Animals",
        "ha.dang@inkdeck.seed",
        "Clone: Farm Animals",
    );
};
