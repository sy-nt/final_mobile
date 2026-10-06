import { Column, Entity } from "typeorm";

import { BaseEntityWithUUID } from "./base";

@Entity({
    name: "user_stats",
})
export class UserStatEntity extends BaseEntityWithUUID {
    @Column({
        default: 0,
        name: "current_streak",
        type: "smallint",
    })
    currentStreak!: number;

    @Column({
        name: "last_activity_date",
        nullable: true,
        type: "date",
    })
    lastActivityDate?: Date;

    @Column({
        default: 0,
        name: "longest_streak",
        type: "smallint",
    })
    longestStreak!: number;

    @Column({
        default: 0,
        name: "total_attempts_completed",
        type: "int",
    })
    totalAttemptsCompleted!: number;

    @Column({
        default: 0,
        name: "total_correct_answers",
        type: "int",
    })
    totalCorrectAnswers!: number;

    @Column({
        default: 0,
        name: "total_points",
        type: "int",
    })
    totalPoints!: number;

    @Column({
        name: "user_id",
        type: "uuid",
        unique: true,
    })
    userId!: string;
}
