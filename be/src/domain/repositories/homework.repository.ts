import { HomeworkEntity } from "@domain/entities";

import { BaseRepository } from "./base";

export class HomeworkRepository extends BaseRepository<HomeworkEntity> {}
const homeworkRepository = new HomeworkRepository(HomeworkEntity);
export default homeworkRepository;
