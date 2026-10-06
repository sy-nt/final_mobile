import { Column, Entity, Index } from "typeorm";

import { BaseEntityWithUUID } from "./base";

export enum ShareStatus {
    ACTIVE = "ACTIVE",
    REVOKED = "REVOKED",
}

export enum ShareType {
    ALL = "ALL",
    EMAIL = "EMAIL",
}

@Entity({
    name: "course_shares",
})
@Index(["courseId"])
export class CourseShareEntity extends BaseEntityWithUUID {
    @Column({
        name: "course_id",
        type: "uuid",
    })
    courseId!: string;

    @Column({
        name: "shared_by_user_id",
        type: "uuid",
    })
    sharedByUserId!: string;

    @Column({
        name: "shared_with_email",
        nullable: true,
        type: "varchar",
    })
    sharedWithEmail?: string;

    @Column({
        enum: ShareType,
        enumName: "share_type",
        name: "share_type",
        type: "enum",
    })
    shareType!: ShareType;

    @Column({
        default: ShareStatus.ACTIVE,
        enum: ShareStatus,
        enumName: "share_status",
        type: "enum",
    })
    status!: ShareStatus;
}
