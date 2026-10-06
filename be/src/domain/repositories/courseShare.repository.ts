import { CourseShareEntity } from "@domain/entities";

import { BaseRepository } from "./base";

export class CourseShareRepository extends BaseRepository<CourseShareEntity> {}
const courseShareRepository = new CourseShareRepository(CourseShareEntity);
export default courseShareRepository;
