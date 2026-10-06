import AppDataSource from "@domain/db/postgres";
import {
    CourseEntity,
    ShareStatus,
    ShareType,
} from "@domain/entities";
import { BaseService } from "@shared/lib/base/service";
import { ForbiddenError, NotFoundError } from "@shared/lib/http/httpError";
import { KeySetPaginationDto, KeySetPaginationResponse } from "@shared/types";
import { removeNil } from "@shared/utils/object";
import { FindOptionsWhere, ILike, In } from "typeorm";

import { CourseError } from "./course.constants";
import {
    CourseResponseDto,
    CreateCourseRequestDto,
    CreateCourseResponseDto,
    DeleteCourseParamsDto,
    GetCourseByIdParamsDto,
    GetCourseByIdResponseDto,
    GetCourseGalleryRequestDto,
    GetCourseGalleryResponseDto,
    GetCoursesRequestDto,
    GetCoursesResponseDto,
    UpdateCourseParamsDto,
    UpdateCourseRequestDto,
    UpdateCourseResponseDto,
} from "./course.dto";

export class CourseService extends BaseService {
    createCourse = async (
        dto: CreateCourseRequestDto,
        callerId: string,
    ): Promise<CreateCourseResponseDto> => {
        const course = await AppDataSource.transaction(async (manager) => {
            return this.repositories.course.create(manager, {
                description: dto.description,
                ownerId: callerId,
                title: dto.title,
            });
        });

        return this._toDto(course, callerId);
    };

    deleteCourse = async (
        params: DeleteCourseParamsDto,
        callerId: string,
    ): Promise<void> => {
        await this._getOwnedCourseOrThrow(params.id, callerId);

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.course.delete(manager, { id: params.id });
        });
    };

    getCourseById = async (
        params: GetCourseByIdParamsDto,
        callerId: string,
    ): Promise<GetCourseByIdResponseDto> => {
        const course = await this.repositories.course.findOne({
            where: { id: params.id },
        });
        if (!course) throw new NotFoundError(CourseError.COURSE_NOT_FOUND);

        const isOwner = course.ownerId === callerId;
        if (!isOwner && !(await this._isPubliclyVisible(course.id))) {
            throw new NotFoundError(CourseError.COURSE_NOT_FOUND);
        }

        const [dto] = await this._withTags([this._toDto(course, callerId)]);
        return dto;
    };

    getCourseGallery = async (
        dto: GetCourseGalleryRequestDto,
        callerId: string,
    ): Promise<GetCourseGalleryResponseDto> => {
        const courseIds = await this._getGalleryCourseIds(dto.tag);
        if (courseIds.length === 0) {
            return { hasNextPage: false, items: [], lastId: "" };
        }

        const where: FindOptionsWhere<CourseEntity> = {
            id: In(courseIds),
            isSuspended: false,
            ...(dto.title ? { title: ILike(`%${dto.title}%`) } : {}),
        };

        return this._paginateCourses(where, dto, callerId);
    };

    getCourses = async (
        dto: GetCoursesRequestDto,
        callerId: string,
    ): Promise<GetCoursesResponseDto> => {
        if (!dto.folderId) {
            return this._paginateCourses({ ownerId: callerId }, dto, callerId);
        }

        const folderCourseIds = await this._getFolderCourseIds(dto.folderId);
        if (folderCourseIds.length === 0) {
            return { hasNextPage: false, items: [], lastId: "" };
        }

        return this._paginateCourses(
            { id: In(folderCourseIds), ownerId: callerId },
            dto,
            callerId,
        );
    };

    updateCourse = async (
        params: UpdateCourseParamsDto,
        dto: UpdateCourseRequestDto,
        callerId: string,
    ): Promise<UpdateCourseResponseDto> => {
        await this._getOwnedCourseOrThrow(params.id, callerId);

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.course.update(
                manager,
                { id: params.id },
                removeNil({
                    description: dto.description,
                    title: dto.title,
                    visibility: dto.visibility,
                }),
            );
        });

        return this.getCourseById({ id: params.id }, callerId);
    };

    private _getFolderCourseIds = async (folderId: string) => {
        const folderCourses = await this.repositories.folderCourse.find({
            select: { courseId: true },
            where: { folderId },
        });
        return folderCourses.map((folderCourse) => folderCourse.courseId);
    };

    private _getGalleryCourseIds = async (tag?: string) => {
        const shares = await this.repositories.courseShare.find({
            select: { courseId: true },
            where: { shareType: ShareType.ALL, status: ShareStatus.ACTIVE },
        });
        const sharedIds = shares.map((share) => share.courseId);
        if (!tag) return sharedIds;

        const tagEntity = await this.repositories.tag.findOne({
            where: { name: ILike(tag) },
        });
        if (!tagEntity) return [];

        const courseTags = await this.repositories.courseTag.find({
            select: { courseId: true },
            where: { tagId: tagEntity.id },
        });
        const taggedIds = new Set(
            courseTags.map((courseTag) => courseTag.courseId),
        );
        return sharedIds.filter((id) => taggedIds.has(id));
    };

    private _getOwnedCourseOrThrow = async (id: string, callerId: string) => {
        const course = await this.repositories.course.findOne({
            where: { id },
        });
        if (!course) throw new NotFoundError(CourseError.COURSE_NOT_FOUND);
        if (course.ownerId !== callerId) {
            throw new ForbiddenError(CourseError.COURSE_FORBIDDEN);
        }
        return course;
    };

    private _isPubliclyVisible = async (courseId: string) => {
        const share = await this.repositories.courseShare.findOne({
            where: {
                courseId,
                shareType: ShareType.ALL,
                status: ShareStatus.ACTIVE,
            },
        });
        return Boolean(share);
    };

    private _paginateCourses = async (
        where: FindOptionsWhere<CourseEntity>,
        pagination: KeySetPaginationDto,
        callerId: string,
    ): Promise<KeySetPaginationResponse<CourseResponseDto>> => {
        const result = await this.repositories.course.paginateKeySet(
            { where },
            pagination,
        );

        const items = await this._withTags(
            result.items.map((course) => this._toDto(course, callerId)),
        );
        return { ...result, items };
    };

    private _tagNamesByCourse = async (courseIds: string[]) => {
        const names = new Map<string, string[]>();
        if (courseIds.length === 0) return names;
        const links = await this.repositories.courseTag.find({
            where: { courseId: In(courseIds) },
        });
        if (links.length === 0) return names;
        const tags = await this.repositories.tag.find({
            where: { id: In(links.map((link) => link.tagId)) },
        });
        const nameById = new Map(tags.map((tag) => [tag.id, tag.name]));
        for (const link of links) {
            const name = nameById.get(link.tagId);
            if (!name) continue;
            const list = names.get(link.courseId) ?? [];
            list.push(name);
            names.set(link.courseId, list);
        }
        return names;
    };

    private _toDto = (
        course: CourseEntity,
        callerId: string,
    ): CourseResponseDto => {
        return {
            cloneCount: course.cloneCount,
            description: course.description,
            id: course.id,
            isOwner: course.ownerId === callerId,
            tags: [],
            title: course.title,
            visibility: course.visibility,
        };
    };

    private _withTags = async (items: CourseResponseDto[]) => {
        const names = await this._tagNamesByCourse(items.map((item) => item.id));
        return items.map((item) => ({
            ...item,
            tags: names.get(item.id) ?? [],
        }));
    };
}

const courseService = new CourseService();
export default courseService;
