import { HomeworkAttemptAnswerEntity } from "@domain/entities";

import { BaseRepository } from "./base";

export class HomeworkAttemptAnswerRepository extends BaseRepository<HomeworkAttemptAnswerEntity> {}
const homeworkAttemptAnswerRepository = new HomeworkAttemptAnswerRepository(
    HomeworkAttemptAnswerEntity,
);
export default homeworkAttemptAnswerRepository;
