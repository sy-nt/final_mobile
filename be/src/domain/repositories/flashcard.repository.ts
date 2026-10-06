import { FlashcardEntity } from "@domain/entities";

import { BaseRepository } from "./base";

export class FlashcardRepository extends BaseRepository<FlashcardEntity> {}
const flashcardRepository = new FlashcardRepository(FlashcardEntity);
export default flashcardRepository;
