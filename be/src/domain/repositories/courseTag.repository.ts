import { CourseTagEntity } from "@domain/entities";

import { BaseRepository } from "./base";

export class CourseTagRepository extends BaseRepository<CourseTagEntity> {}
const courseTagRepository = new CourseTagRepository(CourseTagEntity);
export default courseTagRepository;
