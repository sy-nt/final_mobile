import { Column, Entity, Index, Unique } from "typeorm";

import { BaseEntityWithUUID } from "./base";

@Entity({
    name: "flashcards",
})
@Index(["courseId"])
@Unique(["courseId", "wordEn"])
export class FlashcardEntity extends BaseEntityWithUUID {
    @Column({
        name: "course_id",
        type: "uuid",
    })
    courseId!: string;

    @Column({
        nullable: true,
        type: "text",
    })
    example?: string;

    @Column({
        type: "smallint",
    })
    position!: number;

    @Column({
        length: 255,
        name: "word_en",
        type: "varchar",
    })
    wordEn!: string;

    @Column({
        length: 255,
        name: "word_vi",
        type: "varchar",
    })
    wordVi!: string;
}
