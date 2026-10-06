import { CourseError } from "@api/course/course.constants";
import AppDataSource from "@domain/db/postgres";
import { FlashcardEntity, ShareStatus, ShareType } from "@domain/entities";
import { BaseService } from "@shared/lib/base/service";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
} from "@shared/lib/http/httpError";
import { removeNil } from "@shared/utils/object";

import {
    FlashcardError,
    MAX_FLASHCARDS_PER_COURSE,
} from "./flashcard.constants";
import {
    BulkCreateFlashcardRequestDto,
    BulkCreateFlashcardResponseDto,
    CreateFlashcardRequestDto,
    CreateFlashcardResponseDto,
    DeleteFlashcardParamsDto,
    FlashcardResponseDto,
    GetFlashcardsResponseDto,
    UpdateFlashcardParamsDto,
    UpdateFlashcardRequestDto,
    UpdateFlashcardResponseDto,
} from "./flashcard.dto";

export class FlashcardService extends BaseService {
    bulkCreateFlashcards = async (
        courseId: string,
        dto: BulkCreateFlashcardRequestDto,
        callerId: string,
    ): Promise<BulkCreateFlashcardResponseDto> => {
        await this._getOwnedCourseOrThrow(courseId, callerId);
        const existingCount = await this._countFlashcards(courseId);
        if (
            existingCount + dto.flashcards.length >
            MAX_FLASHCARDS_PER_COURSE
        ) {
            throw new BadRequestError(FlashcardError.COURSE_FULL);
        }

        const flashcards = await AppDataSource.transaction(async (manager) => {
            return this.repositories.flashcard.createMany(
                manager,
                dto.flashcards.map((item, index) => ({
                    courseId,
                    example: item.example,
                    position: existingCount + index + 1,
                    wordEn: item.wordEn,
                    wordVi: item.wordVi,
                })),
            );
        });

        return flashcards.map((flashcard) => this._toDto(flashcard));
    };

    createFlashcard = async (
        courseId: string,
        dto: CreateFlashcardRequestDto,
        callerId: string,
    ): Promise<CreateFlashcardResponseDto> => {
        await this._getOwnedCourseOrThrow(courseId, callerId);
        const existingCount = await this._countFlashcards(courseId);
        if (existingCount >= MAX_FLASHCARDS_PER_COURSE) {
            throw new BadRequestError(FlashcardError.COURSE_FULL);
        }

        const flashcard = await AppDataSource.transaction(async (manager) => {
            return this.repositories.flashcard.create(manager, {
                courseId,
                example: dto.example,
                position: existingCount + 1,
                wordEn: dto.wordEn,
                wordVi: dto.wordVi,
            });
        });

        return this._toDto(flashcard);
    };

    deleteFlashcard = async (
        params: DeleteFlashcardParamsDto,
        callerId: string,
    ): Promise<void> => {
        await this._getOwnedCourseOrThrow(params.courseId, callerId);
        await this._getFlashcardOrThrow(params.courseId, params.id);

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.flashcard.delete(manager, {
                id: params.id,
            });
        });
    };

    getFlashcards = async (
        courseId: string,
        callerId: string,
    ): Promise<GetFlashcardsResponseDto> => {
        await this._getAccessibleCourseOrThrow(courseId, callerId);

        const flashcards = await this.repositories.flashcard.find({
            order: { position: "ASC" },
            where: { courseId },
        });

        return flashcards.map((flashcard) => this._toDto(flashcard));
    };

    updateFlashcard = async (
        params: UpdateFlashcardParamsDto,
        dto: UpdateFlashcardRequestDto,
        callerId: string,
    ): Promise<UpdateFlashcardResponseDto> => {
        await this._getOwnedCourseOrThrow(params.courseId, callerId);
        await this._getFlashcardOrThrow(params.courseId, params.id);

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.flashcard.update(
                manager,
                { id: params.id },
                removeNil({
                    example: dto.example,
                    position: dto.position,
                    wordEn: dto.wordEn,
                    wordVi: dto.wordVi,
                }),
            );
        });

        const updated = await this._getFlashcardOrThrow(
            params.courseId,
            params.id,
        );
        return this._toDto(updated);
    };

    private _countFlashcards = async (courseId: string) => {
        const flashcards = await this.repositories.flashcard.find({
            select: { id: true },
            where: { courseId },
        });
        return flashcards.length;
    };

    private _getAccessibleCourseOrThrow = async (
        courseId: string,
        callerId: string,
    ) => {
        const course = await this.repositories.course.findOne({
            where: { id: courseId },
        });
        if (!course) throw new NotFoundError(CourseError.COURSE_NOT_FOUND);
        if (course.ownerId === callerId) return course;

        const share = await this.repositories.courseShare.findOne({
            where: {
                courseId,
                shareType: ShareType.ALL,
                status: ShareStatus.ACTIVE,
            },
        });
        if (!share || course.isSuspended) {
            throw new NotFoundError(CourseError.COURSE_NOT_FOUND);
        }
        return course;
    };

    private _getFlashcardOrThrow = async (courseId: string, id: string) => {
        const flashcard = await this.repositories.flashcard.findOne({
            where: { courseId, id },
        });
        if (!flashcard) {
            throw new NotFoundError(FlashcardError.FLASHCARD_NOT_FOUND);
        }
        return flashcard;
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

    private _toDto = (flashcard: FlashcardEntity): FlashcardResponseDto => {
        return {
            example: flashcard.example,
            id: flashcard.id,
            position: flashcard.position,
            wordEn: flashcard.wordEn,
            wordVi: flashcard.wordVi,
        };
    };
}

const flashcardService = new FlashcardService();
export default flashcardService;
