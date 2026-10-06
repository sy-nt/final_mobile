import { Column, Entity, Index } from "typeorm";

import { BaseEntityWithUUID } from "./base";
import { HomeworkDirection } from "./homework.entity";

@Entity({
    name: "homework_attempt_answers",
})
@Index(["attemptId"])
export class HomeworkAttemptAnswerEntity extends BaseEntityWithUUID {
    @Column({
        name: "attempt_id",
        type: "uuid",
    })
    attemptId!: string;

    @Column({
        name: "flashcard_id",
        nullable: true,
        type: "uuid",
    })
    flashcardId?: string;

    @Column({
        default: false,
        name: "is_correct",
        type: "boolean",
    })
    isCorrect!: boolean;

    @Column({
        enum: HomeworkDirection,
        enumName: "homework_direction",
        name: "question_direction",
        type: "enum",
    })
    questionDirection!: HomeworkDirection;

    @Column({
        name: "user_answer",
        type: "text",
    })
    userAnswer!: string;
}
