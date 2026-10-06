import { FolderCourseEntity } from "@domain/entities";

import { BaseRepository } from "./base";

export class FolderCourseRepository extends BaseRepository<FolderCourseEntity> {}
const folderCourseRepository = new FolderCourseRepository(FolderCourseEntity);
export default folderCourseRepository;
