import { CourseError } from "@api/course/course.constants";
import AppDataSource from "@domain/db/postgres";
import { HomeworkEntity } from "@domain/entities";
import { BaseService } from "@shared/lib/base/service";
import { ForbiddenError, NotFoundError } from "@shared/lib/http/httpError";
import { removeNil } from "@shared/utils/object";

import { HomeworkError } from "./homework.constants";
import {
    CreateHomeworkRequestDto,
    CreateHomeworkResponseDto,
    DeleteHomeworkParamsDto,
    GetHomeworkByIdParamsDto,
    GetHomeworkByIdResponseDto,
    GetHomeworksRequestDto,
    GetHomeworksResponseDto,
    HomeworkResponseDto,
    UpdateHomeworkParamsDto,
    UpdateHomeworkRequestDto,
    UpdateHomeworkResponseDto,
} from "./homework.dto";

export class HomeworkService extends BaseService {
    createHomework = async (
        dto: CreateHomeworkRequestDto,
        callerId: string,
    ): Promise<CreateHomeworkResponseDto> => {
        await this._getOwnedCourseOrThrow(dto.courseId, callerId);

        const homework = await AppDataSource.transaction(async (manager) => {
            return this.repositories.homework.create(manager, {
                courseId: dto.courseId,
                direction: dto.direction,
                questionCount: dto.questionCount,
                title: dto.title,
                type: dto.type,
                userId: callerId,
            });
        });

        return this._toDto(homework);
    };

    deleteHomework = async (
        params: DeleteHomeworkParamsDto,
        callerId: string,
    ): Promise<void> => {
        await this._getOwnedHomeworkOrThrow(params.id, callerId);

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.homework.softDelete(manager, {
                id: params.id,
            });
        });
    };

    getHomeworkById = async (
        params: GetHomeworkByIdParamsDto,
        callerId: string,
    ): Promise<GetHomeworkByIdResponseDto> => {
        const homework = await this._getOwnedHomeworkOrThrow(
            params.id,
            callerId,
        );
        return this._toDto(homework);
    };

    getHomeworks = async (
        dto: GetHomeworksRequestDto,
        callerId: string,
    ): Promise<GetHomeworksResponseDto> => {
        const homeworks = await this.repositories.homework.find({
            order: { createdAt: "DESC" },
            where: {
                userId: callerId,
                ...(dto.courseId ? { courseId: dto.courseId } : {}),
            },
        });
        return homeworks.map((homework) => this._toDto(homework));
    };

    updateHomework = async (
        params: UpdateHomeworkParamsDto,
        dto: UpdateHomeworkRequestDto,
        callerId: string,
    ): Promise<UpdateHomeworkResponseDto> => {
        await this._getOwnedHomeworkOrThrow(params.id, callerId);

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.homework.update(
                manager,
                { id: params.id },
                removeNil({
                    direction: dto.direction,
                    questionCount: dto.questionCount,
                    title: dto.title,
                }),
            );
        });

        return this.getHomeworkById({ id: params.id }, callerId);
    };

    private _getOwnedCourseOrThrow = async (
        courseId: string,
        callerId: string,
    ) => {
        const course = await this.repositories.course.findOne({
            where: { id: courseId },
        });
        if (!course) throw new NotFoundError(CourseError.COURSE_NOT_FOUND);
        if (course.ownerId !== callerId) {
            throw new ForbiddenError(CourseError.COURSE_FORBIDDEN);
        }
        return course;
    };

    private _getOwnedHomeworkOrThrow = async (id: string, callerId: string) => {
        const homework = await this.repositories.homework.findOne({
            where: { id },
        });
        if (!homework) {
            throw new NotFoundError(HomeworkError.HOMEWORK_NOT_FOUND);
        }
        if (homework.userId !== callerId) {
            throw new ForbiddenError(HomeworkError.HOMEWORK_FORBIDDEN);
        }
        return homework;
    };

    private _toDto = (homework: HomeworkEntity): HomeworkResponseDto => {
        return {
            courseId: homework.courseId,
            direction: homework.direction,
            id: homework.id,
            questionCount: homework.questionCount,
            title: homework.title,
            type: homework.type,
        };
    };
}

const homeworkService = new HomeworkService();
export default homeworkService;
