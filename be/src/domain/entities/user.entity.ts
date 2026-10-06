import { Column, Entity, Index, Unique } from "typeorm";

import { BaseEntityWithUUID } from "./base";

export enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER",
}

@Entity({
    name: "users",
})
@Index(["email"])
@Unique(["email"])
export class UserEntity extends BaseEntityWithUUID {
    @Column({
        length: 255,
        type: "varchar",
        unique: true,
    })
    email!: string;

    @Column({
        length: 255,
        name: "first_name",
        type: "varchar",
    })
    firstName!: string;

    @Column({
        name: "last_login_at",
        nullable: true,
        type: "timestamp with time zone",
    })
    lastLoginAt?: Date;

    @Column({
        length: 255,
        name: "last_name",
        type: "varchar",
    })
    lastName!: string;

    @Column({
        length: 255,
        type: "varchar",
    })
    password!: string;

    @Column({
        default: UserRole.USER,
        enum: UserRole,
        enumName: "user_role",
        type: "enum",
    })
    role!: UserRole;
}
