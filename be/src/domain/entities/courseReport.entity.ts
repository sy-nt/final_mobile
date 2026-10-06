import { Column, Entity, Index } from "typeorm";

import { BaseEntityWithUUID } from "./base";

export enum ReportReason {
    COPYRIGHT = "COPYRIGHT",
    INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
    OTHER = "OTHER",
    SPAM = "SPAM",
}

export enum ReportStatus {
    ACTION_TAKEN = "ACTION_TAKEN",
    DISMISSED = "DISMISSED",
    PENDING = "PENDING",
    REVIEWED = "REVIEWED",
}

@Entity({
    name: "course_reports",
})
@Index(["courseId"])
@Index(["status"])
export class CourseReportEntity extends BaseEntityWithUUID {
    @Column({
        name: "course_id",
        type: "uuid",
    })
    courseId!: string;

    @Column({
        nullable: true,
        type: "text",
    })
    detail?: string;

    @Column({
        enum: ReportReason,
        enumName: "report_reason",
        type: "enum",
    })
    reason!: ReportReason;

    @Column({
        name: "reported_by_user_id",
        type: "uuid",
    })
    reportedByUserId!: string;

    @Column({
        name: "reviewed_by_user_id",
        nullable: true,
        type: "uuid",
    })
    reviewedByUserId?: string;

    @Column({
        name: "review_note",
        nullable: true,
        type: "text",
    })
    reviewNote?: string;

    @Column({
        default: ReportStatus.PENDING,
        enum: ReportStatus,
        enumName: "report_status",
        type: "enum",
    })
    status!: ReportStatus;
}
