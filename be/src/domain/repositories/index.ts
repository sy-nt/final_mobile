import courseRepository from "./course.repository";
import courseReportRepository from "./courseReport.repository";
import courseShareRepository from "./courseShare.repository";
import courseTagRepository from "./courseTag.repository";
import flashcardRepository from "./flashcard.repository";
import folderRepository from "./folder.repository";
import folderCourseRepository from "./folderCourse.repository";
import homeworkRepository from "./homework.repository";
import homeworkAttemptRepository from "./homeworkAttempt.repository";
import homeworkAttemptAnswerRepository from "./homeworkAttemptAnswer.repository";
import tagRepository from "./tag.repository";
import userRepository from "./user.repository";
import userStatRepository from "./userStat.repository";

const repositories = {
    course: courseRepository,
    courseReport: courseReportRepository,
    courseShare: courseShareRepository,
    courseTag: courseTagRepository,
    flashcard: flashcardRepository,
    folder: folderRepository,
    folderCourse: folderCourseRepository,
    homework: homeworkRepository,
    homeworkAttempt: homeworkAttemptRepository,
    homeworkAttemptAnswer: homeworkAttemptAnswerRepository,
    tag: tagRepository,
    user: userRepository,
    userStat: userStatRepository,
} as const;

export type Repositories = typeof repositories;
export default repositories;
