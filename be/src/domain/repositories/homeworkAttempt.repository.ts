import { HomeworkAttemptEntity } from "@domain/entities";

import { BaseRepository } from "./base";

export class HomeworkAttemptRepository extends BaseRepository<HomeworkAttemptEntity> {}
const homeworkAttemptRepository = new HomeworkAttemptRepository(
    HomeworkAttemptEntity,
);
export default homeworkAttemptRepository;
