import { CourseError } from "@api/course/course.constants";
import AppDataSource from "@domain/db/postgres";
import {
    CourseEntity,
    CourseShareEntity,
    ShareStatus,
    ShareType,
} from "@domain/entities";
import { BaseService } from "@shared/lib/base/service";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
} from "@shared/lib/http/httpError";
import { In } from "typeorm";

import { CourseShareError } from "./courseShare.constants";
import {
    AcceptShareParamsDto,
    AcceptShareResponseDto,
    ClonedCourseResponseDto,
    CourseShareResponseDto,
    CreateCourseShareRequestDto,
    CreateCourseShareResponseDto,
    DeleteCourseShareParamsDto,
    GetCourseSharesResponseDto,
    GetShareInvitesResponseDto,
    ShareInviteResponseDto,
} from "./courseShare.dto";

export class CourseShareService extends BaseService {
    acceptShare = async (
        params: AcceptShareParamsDto,
        callerId: string,
    ): Promise<AcceptShareResponseDto> => {
        const share = await this._getShareOrThrow(params.shareId);
        if (share.status !== ShareStatus.ACTIVE) {
            throw new NotFoundError(CourseShareError.SHARE_NOT_FOUND);
        }
        if (share.shareType === ShareType.EMAIL) {
            await this._assertShareBelongsToCaller(share, callerId);
        }

        const existing = await this.repositories.course.findOne({
            where: { ownerId: callerId, sourceCourseId: share.courseId },
        });
        if (existing) return this._toCourseDto(existing);

        const cloned = await this._cloneCourse(share.courseId, callerId);
        return this._toCourseDto(cloned);
    };

    clonePublicCourse = async (
        courseId: string,
        callerId: string,
    ): Promise<AcceptShareResponseDto> => {
        const course = await this.repositories.course.findOne({
            where: { id: courseId },
        });
        if (!course || course.isSuspended) {
            throw new NotFoundError(CourseError.COURSE_NOT_FOUND);
        }
        if (course.ownerId === callerId) {
            throw new BadRequestError(CourseShareError.ALREADY_OWNED);
        }

        const share = await this.repositories.courseShare.findOne({
            where: {
                courseId,
                shareType: ShareType.ALL,
                status: ShareStatus.ACTIVE,
            },
        });
        if (!share) throw new NotFoundError(CourseError.COURSE_NOT_FOUND);

        const existing = await this.repositories.course.findOne({
            where: { ownerId: callerId, sourceCourseId: courseId },
        });
        if (existing) return this._toCourseDto(existing);

        const cloned = await this._cloneCourse(courseId, callerId);
        return this._toCourseDto(cloned);
    };

    createShare = async (
        courseId: string,
        dto: CreateCourseShareRequestDto,
        callerId: string,
    ): Promise<CreateCourseShareResponseDto> => {
        await this._getOwnedCourseOrThrow(courseId, callerId);

        const sharedWithEmail = await this._resolveSharedWithEmail(dto);

        const existing = await this.repositories.courseShare.findOne({
            where: {
                courseId,
                shareType: dto.shareType,
                status: ShareStatus.ACTIVE,
                ...(sharedWithEmail ? { sharedWithEmail } : {}),
            },
        });
        if (existing) return this._toDto(existing);

        const share = await AppDataSource.transaction(async (manager) => {
            return this.repositories.courseShare.create(manager, {
                courseId,
                sharedByUserId: callerId,
                sharedWithEmail,
                shareType: dto.shareType,
                status: ShareStatus.ACTIVE,
            });
        });

        return this._toDto(share);
    };

    getInvites = async (
        callerId: string,
    ): Promise<GetShareInvitesResponseDto> => {
        const caller = await this.repositories.user.findOne({
            where: { id: callerId },
        });
        if (!caller) return [];

        const pending = await this._getPendingInviteShares(caller.email, callerId);
        if (pending.length === 0) return [];

        const courses = await this.repositories.course.find({
            where: { id: In(pending.map((share) => share.courseId)) },
        });
        const courseById = new Map(
            courses.map((course) => [course.id, course]),
        );

        return pending.map((share) =>
            this._toInviteDto(share, courseById.get(share.courseId)),
        );
    };

    getShares = async (
        courseId: string,
        callerId: string,
    ): Promise<GetCourseSharesResponseDto> => {
        await this._getOwnedCourseOrThrow(courseId, callerId);

        const shares = await this.repositories.courseShare.find({
            order: { createdAt: "DESC" },
            where: { courseId },
        });
        return shares.map((share) => this._toDto(share));
    };

    revokeShare = async (
        params: DeleteCourseShareParamsDto,
        callerId: string,
    ): Promise<void> => {
        await this._getOwnedCourseOrThrow(params.courseId, callerId);
        const share = await this._getShareOrThrow(params.shareId);
        if (share.courseId !== params.courseId) {
            throw new NotFoundError(CourseShareError.SHARE_NOT_FOUND);
        }

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.courseShare.update(
                manager,
                { id: params.shareId },
                { status: ShareStatus.REVOKED },
            );
        });
    };

    private _assertShareBelongsToCaller = async (
        share: CourseShareEntity,
        callerId: string,
    ) => {
        const caller = await this.repositories.user.findOne({
            where: { id: callerId },
        });
        if (!caller || share.sharedWithEmail !== caller.email) {
            throw new ForbiddenError(CourseShareError.SHARE_FORBIDDEN);
        }
    };

    private _cloneCourse = async (sourceCourseId: string, callerId: string) => {
        return AppDataSource.transaction(async (manager) => {
            const sourceCourse = await this.repositories.course.findOne({
                where: { id: sourceCourseId },
            });
            if (!sourceCourse) {
                throw new NotFoundError(CourseError.COURSE_NOT_FOUND);
            }

            const flashcards = await this.repositories.flashcard.find({
                where: { courseId: sourceCourseId },
            });

            const newCourse = await this.repositories.course.create(manager, {
                description: sourceCourse.description,
                ownerId: callerId,
                sourceCourseId: sourceCourse.id,
                title: sourceCourse.title,
            });

            if (flashcards.length > 0) {
                await this.repositories.flashcard.createMany(
                    manager,
                    flashcards.map((flashcard) => ({
                        courseId: newCourse.id,
                        example: flashcard.example,
                        position: flashcard.position,
                        wordEn: flashcard.wordEn,
                        wordVi: flashcard.wordVi,
                    })),
                );
            }

            await this.repositories.course.update(
                manager,
                { id: sourceCourse.id },
                { cloneCount: sourceCourse.cloneCount + 1 },
            );

            return newCourse;
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

    private _getPendingInviteShares = async (
        email: string,
        callerId: string,
    ) => {
        const shares = await this.repositories.courseShare.find({
            where: {
                sharedWithEmail: email,
                shareType: ShareType.EMAIL,
                status: ShareStatus.ACTIVE,
            },
        });
        if (shares.length === 0) return [];

        const clonedCourses = await this.repositories.course.find({
            select: { sourceCourseId: true },
            where: {
                ownerId: callerId,
                sourceCourseId: In(shares.map((share) => share.courseId)),
            },
        });
        const clonedSourceIds = new Set(
            clonedCourses.map((course) => course.sourceCourseId),
        );
        return shares.filter((share) => !clonedSourceIds.has(share.courseId));
    };

    private _getShareOrThrow = async (id: string) => {
        const share = await this.repositories.courseShare.findOne({
            where: { id },
        });
        if (!share) throw new NotFoundError(CourseShareError.SHARE_NOT_FOUND);
        return share;
    };

    private _resolveSharedWithEmail = async (
        dto: CreateCourseShareRequestDto,
    ): Promise<string | undefined> => {
        if (dto.shareType !== ShareType.EMAIL) return undefined;

        const user = await this.repositories.user.findOne({
            where: { email: dto.email },
        });
        if (!user) {
            throw new BadRequestError(CourseShareError.EMAIL_USER_NOT_FOUND);
        }
        return user.email;
    };

    private _toCourseDto = (course: CourseEntity): ClonedCourseResponseDto => {
        return {
            description: course.description,
            id: course.id,
            title: course.title,
            visibility: course.visibility,
        };
    };

    private _toDto = (share: CourseShareEntity): CourseShareResponseDto => {
        return {
            courseId: share.courseId,
            id: share.id,
            sharedWithEmail: share.sharedWithEmail,
            shareType: share.shareType,
            status: share.status,
        };
    };

    private _toInviteDto = (
        share: CourseShareEntity,
        course?: CourseEntity,
    ): ShareInviteResponseDto => {
        return {
            courseId: share.courseId,
            courseTitle: course?.title ?? "",
            id: share.id,
            sharedByUserId: share.sharedByUserId,
        };
    };
}

const courseShareService = new CourseShareService();
export default courseShareService;
