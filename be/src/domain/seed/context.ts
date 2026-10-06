import {
    CourseEntity,
    FlashcardEntity,
    TagEntity,
    UserEntity,
} from "@domain/entities";
import { EntityManager } from "typeorm";

export interface SeedContext {
    courses: Map<string, CourseEntity>;
    flashcards: Map<string, FlashcardEntity[]>;
    manager: EntityManager;
    tags: Map<string, TagEntity>;
    users: Map<string, UserEntity>;
}
