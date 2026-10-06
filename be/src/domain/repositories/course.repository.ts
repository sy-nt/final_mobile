import { CourseEntity } from "@domain/entities";

import { BaseRepository } from "./base";

export class CourseRepository extends BaseRepository<CourseEntity> {}
const courseRepository = new CourseRepository(CourseEntity);
export default courseRepository;
