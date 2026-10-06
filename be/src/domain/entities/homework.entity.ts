import { Column, Entity, Index } from "typeorm";

import { BaseEntityWithUUID } from "./base";

export enum HomeworkDirection {
    EN_TO_VI = "EN_TO_VI",
    MIXED = "MIXED",
    VI_TO_EN = "VI_TO_EN",
}

export enum HomeworkType {
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    WRITE_WORD = "WRITE_WORD",
}

@Entity({
    name: "homeworks",
})
@Index(["courseId"])
@Index(["userId"])
export class HomeworkEntity extends BaseEntityWithUUID {
    @Column({
        name: "course_id",
        type: "uuid",
    })
    courseId!: string;

    @Column({
        default: HomeworkDirection.MIXED,
        enum: HomeworkDirection,
        enumName: "homework_direction",
        type: "enum",
    })
    direction!: HomeworkDirection;

    @Column({
        name: "question_count",
        nullable: true,
        type: "smallint",
    })
    questionCount?: number;

    @Column({
        length: 255,
        nullable: true,
        type: "varchar",
    })
    title?: string;

    @Column({
        enum: HomeworkType,
        enumName: "homework_type",
        type: "enum",
    })
    type!: HomeworkType;

    @Column({
        name: "user_id",
        type: "uuid",
    })
    userId!: string;
}
