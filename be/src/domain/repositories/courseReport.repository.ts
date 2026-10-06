import { CourseReportEntity } from "@domain/entities";

import { BaseRepository } from "./base";

export class CourseReportRepository extends BaseRepository<CourseReportEntity> {}
const courseReportRepository = new CourseReportRepository(CourseReportEntity);
export default courseReportRepository;
