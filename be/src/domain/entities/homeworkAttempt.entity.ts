import { Column, Entity, Index } from "typeorm";

import { BaseEntityWithUUID } from "./base";

export enum AttemptStatus {
    COMPLETED = "COMPLETED",
    IN_PROGRESS = "IN_PROGRESS",
}

@Entity({
    name: "homework_attempts",
})
@Index(["homeworkId", "userId"])
@Index(["startedAt"])
export class HomeworkAttemptEntity extends BaseEntityWithUUID {
    @Column({
        name: "completed_at",
        nullable: true,
        type: "timestamp",
    })
    completedAt?: Date;

    @Column({
        default: 0,
        name: "correct_count",
        type: "smallint",
    })
    correctCount!: number;

    @Column({
        name: "homework_id",
        type: "uuid",
    })
    homeworkId!: string;

    @Column({
        nullable: true,
        precision: 5,
        scale: 2,
        transformer: {
            from: (value: null | number | string) =>
                value === null ? undefined : Number(value),
            to: (value?: number) => value,
        },
        type: "numeric",
    })
    score?: number;

    @Column({
        name: "started_at",
        type: "timestamp",
    })
    startedAt!: Date;

    @Column({
        default: AttemptStatus.IN_PROGRESS,
        enum: AttemptStatus,
        enumName: "attempt_status",
        type: "enum",
    })
    status!: AttemptStatus;

    @Column({
        name: "total_questions",
        type: "smallint",
    })
    totalQuestions!: number;

    @Column({
        name: "user_id",
        type: "uuid",
    })
    userId!: string;
}
