import { TagEntity } from "@domain/entities";

import { BaseRepository } from "./base";

export class TagRepository extends BaseRepository<TagEntity> {}
const tagRepository = new TagRepository(TagEntity);
export default tagRepository;
