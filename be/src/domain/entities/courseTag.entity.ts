import { Column, Entity, Unique } from "typeorm";

import { BaseEntityWithUUID } from "./base";

@Entity({
    name: "course_tags",
})
@Unique(["courseId", "tagId"])
export class CourseTagEntity extends BaseEntityWithUUID {
    @Column({
        name: "course_id",
        type: "uuid",
    })
    courseId!: string;

    @Column({
        name: "tag_id",
        type: "uuid",
    })
    tagId!: string;
}
