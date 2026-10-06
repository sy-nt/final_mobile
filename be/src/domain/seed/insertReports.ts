import {
    CourseReportEntity,
    ReportReason,
    ReportStatus,
} from "@domain/entities";

import { SeedContext } from "./context";

export const insertReports = async (ctx: SeedContext) => {
    const repo = ctx.manager.getRepository(CourseReportEntity);
    await repo.save(
        repo.create({
            courseId: ctx.courses.get("Street Food")!.id,
            detail: "Looks fine, just testing the blotter.",
            reason: ReportReason.SPAM,
            reportedByUserId: ctx.users.get("duc.phan@inkdeck.seed")!.id,
            status: ReportStatus.PENDING,
        }),
    );
    await repo.save(
        repo.create({
            courseId: ctx.courses.get("Weather")!.id,
            detail: "False alarm.",
            reason: ReportReason.OTHER,
            reportedByUserId: ctx.users.get("khoa.bui@inkdeck.seed")!.id,
            reviewedByUserId: ctx.users.get("minh.admin@inkdeck.seed")!.id,
            reviewNote: "Nothing wrong with the cards.",
            status: ReportStatus.DISMISSED,
        }),
    );
};
