import { CourseError } from "@api/course/course.constants";
import AppDataSource from "@domain/db/postgres";
import { TagEntity } from "@domain/entities";
import { BaseService } from "@shared/lib/base/service";
import { ForbiddenError, NotFoundError } from "@shared/lib/http/httpError";
import { ILike, In } from "typeorm";

import {
    AttachTagRequestDto,
    AttachTagResponseDto,
    DetachTagParamsDto,
    GetTagsRequestDto,
    GetTagsResponseDto,
    TagResponseDto,
} from "./tag.dto";

export class TagService extends BaseService {
    attachTag = async (
        courseId: string,
        dto: AttachTagRequestDto,
        callerId: string,
    ): Promise<AttachTagResponseDto> => {
        await this._getOwnedCourseOrThrow(courseId, callerId);
        const tag = await this._findOrCreateTag(dto.name);

        const existing = await this.repositories.courseTag.findOne({
            where: { courseId, tagId: tag.id },
        });
        if (!existing) {
            await AppDataSource.transaction(async (manager) => {
                await this.repositories.courseTag.create(manager, {
                    courseId,
                    tagId: tag.id,
                });
            });
        }

        return this._toDto(tag);
    };

    detachTag = async (
        params: DetachTagParamsDto,
        callerId: string,
    ): Promise<void> => {
        await this._getOwnedCourseOrThrow(params.courseId, callerId);

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.courseTag.delete(manager, {
                courseId: params.courseId,
                tagId: params.tagId,
            });
        });
    };

    getCourseTags = async (
        courseId: string,
        callerId: string,
    ): Promise<GetTagsResponseDto> => {
        await this._getOwnedCourseOrThrow(courseId, callerId);
        const links = await this.repositories.courseTag.find({
            where: { courseId },
        });
        if (links.length === 0) return [];

        const tags = await this.repositories.tag.find({
            order: { name: "ASC" },
            where: { id: In(links.map((link) => link.tagId)) },
        });
        return tags.map((tag) => this._toDto(tag));
    };

    getTags = async (dto: GetTagsRequestDto): Promise<GetTagsResponseDto> => {
        const tags = await this.repositories.tag.find({
            order: { name: "ASC" },
            take: 50,
            where: dto.search ? { name: ILike(`%${dto.search}%`) } : {},
        });
        return tags.map((tag) => this._toDto(tag));
    };

    private _findOrCreateTag = async (name: string) => {
        const existing = await this.repositories.tag.findOne({
            where: { name: ILike(name) },
        });
        if (existing) return existing;

        return AppDataSource.transaction(async (manager) => {
            return this.repositories.tag.create(manager, { name });
        });
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

    private _toDto = (tag: TagEntity): TagResponseDto => {
        return { id: tag.id, name: tag.name };
    };
}

const tagService = new TagService();
export default tagService;
