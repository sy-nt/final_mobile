import {
    CourseEntity,
    CourseTagEntity,
    CourseVisibility,
    FlashcardEntity,
} from "@domain/entities";

import { SEED_DECKS } from "./content";
import { SeedContext } from "./context";

const insertCards = async (ctx: SeedContext, courseId: string, title: string) => {
    const deck = SEED_DECKS.find((item) => item.title === title)!;
    const repo = ctx.manager.getRepository(FlashcardEntity);
    const cards: FlashcardEntity[] = [];
    for (const [index, card] of deck.cards.entries()) {
        cards.push(
            await repo.save(
                repo.create({
                    courseId,
                    example: card.example,
                    position: index,
                    wordEn: card.wordEn,
                    wordVi: card.wordVi,
                }),
            ),
        );
    }
    ctx.flashcards.set(title, cards);
};

const attachTags = async (ctx: SeedContext, courseId: string, names: string[]) => {
    const repo = ctx.manager.getRepository(CourseTagEntity);
    for (const name of names) {
        const tag = ctx.tags.get(name);
        if (!tag) continue;
        await repo.save(repo.create({ courseId, tagId: tag.id }));
    }
};

export const insertDecks = async (ctx: SeedContext) => {
    const repo = ctx.manager.getRepository(CourseEntity);
    for (const deck of SEED_DECKS) {
        const owner = ctx.users.get(deck.ownerEmail)!;
        const course = await repo.save(
            repo.create({
                cloneCount: 0,
                description: deck.description,
                isSuspended: false,
                ownerId: owner.id,
                title: deck.title,
                visibility: deck.public
                    ? CourseVisibility.SHARED
                    : CourseVisibility.PRIVATE,
            }),
        );
        ctx.courses.set(deck.title, course);
        await insertCards(ctx, course.id, deck.title);
        await attachTags(ctx, course.id, deck.tags);
    }
};
