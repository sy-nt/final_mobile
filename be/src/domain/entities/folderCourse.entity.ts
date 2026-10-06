import { Column, Entity, Unique } from "typeorm";

import { BaseEntityWithUUID } from "./base";

@Entity({
    name: "folder_courses",
})
@Unique(["folderId", "courseId"])
export class FolderCourseEntity extends BaseEntityWithUUID {
    @Column({
        name: "course_id",
        type: "uuid",
    })
    courseId!: string;

    @Column({
        name: "folder_id",
        type: "uuid",
    })
    folderId!: string;
}
