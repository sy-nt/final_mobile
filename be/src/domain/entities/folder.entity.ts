import { Column, Entity, Index } from "typeorm";

import { BaseEntityWithUUID } from "./base";

@Entity({
    name: "folders",
})
@Index(["userId"])
export class FolderEntity extends BaseEntityWithUUID {
    @Column({
        length: 255,
        type: "varchar",
    })
    name!: string;

    @Column({
        name: "user_id",
        type: "uuid",
    })
    userId!: string;
}
