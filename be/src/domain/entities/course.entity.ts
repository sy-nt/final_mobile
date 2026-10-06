import { Column, Entity, Index } from "typeorm";

import { BaseEntityWithUUID } from "./base";

export enum CourseVisibility {
    PRIVATE = "PRIVATE",
    SHARED = "SHARED",
}

@Entity({
    name: "courses",
})
@Index(["ownerId"])
@Index(["visibility"])
export class CourseEntity extends BaseEntityWithUUID {
    @Column({
        default: 0,
        name: "clone_count",
        type: "smallint",
    })
    cloneCount!: number;

    @Column({
        length: 1000,
        nullable: true,
        type: "varchar",
    })
    description?: string;

    @Column({
        default: false,
        name: "is_suspended",
        type: "boolean",
    })
    isSuspended!: boolean;

    @Column({
        name: "owner_id",
        type: "uuid",
    })
    ownerId!: string;

    @Column({
        name: "source_course_id",
        nullable: true,
        type: "uuid",
    })
    sourceCourseId?: string;

    @Column({
        length: 255,
        type: "varchar",
    })
    title!: string;

    @Column({
        default: CourseVisibility.PRIVATE,
        enum: CourseVisibility,
        enumName: "course_visibility",
        type: "enum",
    })
    visibility!: CourseVisibility;
}
