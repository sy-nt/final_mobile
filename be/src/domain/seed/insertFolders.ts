import { FolderCourseEntity, FolderEntity } from "@domain/entities";

import { SeedContext } from "./context";

const addFolder = async (
    ctx: SeedContext,
    ownerEmail: string,
    name: string,
    titles: string[],
) => {
    const folderRepo = ctx.manager.getRepository(FolderEntity);
    const linkRepo = ctx.manager.getRepository(FolderCourseEntity);
    const folder = await folderRepo.save(
        folderRepo.create({
            name,
            userId: ctx.users.get(ownerEmail)!.id,
        }),
    );
    for (const title of titles) {
        const course = ctx.courses.get(title);
        if (!course) continue;
        await linkRepo.save(
            linkRepo.create({ courseId: course.id, folderId: folder.id }),
        );
    }
};

export const insertFolders = async (ctx: SeedContext) => {
    await addFolder(ctx, "ada.nguyen@inkdeck.seed", "Morning desk", [
        "Everyday Greetings",
        "Kitchen Words",
    ]);
    await addFolder(ctx, "linh.pham@inkdeck.seed", "Travel prep", [
        "Airport English",
    ]);
    await addFolder(ctx, "huy.le@inkdeck.seed", "For the kids", [
        "Farm Animals",
    ]);
    await addFolder(ctx, "an.do@inkdeck.seed", "Copied decks", [
        "Clone: Everyday Greetings",
        "Street Food",
    ]);
};
