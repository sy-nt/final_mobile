import { Column, Entity } from "typeorm";

import { BaseEntityWithUUID } from "./base";

@Entity({
    name: "tags",
})
export class TagEntity extends BaseEntityWithUUID {
    @Column({
        length: 100,
        type: "varchar",
        unique: true,
    })
    name!: string;
}
