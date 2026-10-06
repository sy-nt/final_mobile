import { FlashcardError } from "@api/flashcard/flashcard.constants";
import { HomeworkError } from "@api/homework/homework.constants";
import AppDataSource from "@domain/db/postgres";
import {
    AttemptStatus,
    FlashcardEntity,
    HomeworkAttemptAnswerEntity,
    HomeworkAttemptEntity,
    HomeworkDirection,
    HomeworkEntity,
    HomeworkType,
} from "@domain/entities";
import { BaseService } from "@shared/lib/base/service";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
} from "@shared/lib/http/httpError";
import { KeySetPaginationResponse } from "@shared/types";
import { EntityManager } from "typeorm";

import {
    HomeworkAttemptError,
    POINTS_PER_CORRECT_ANSWER,
} from "./homeworkAttempt.constants";
import {
    AttemptAnswerResponseDto,
    AttemptIdParamsDto,
    AttemptSummaryResponseDto,
    CompleteAttemptResponseDto,
    GetAttemptByIdParamsDto,
    GetAttemptByIdResponseDto,
    GetAttemptsRequestDto,
    GetAttemptsResponseDto,
    HomeworkIdParamsDto,
    QuestionDto,
    StartAttemptResponseDto,
    SubmitAnswerRequestDto,
    SubmitAnswerResponseDto,
} from "./homeworkAttempt.dto";

export class HomeworkAttemptService extends BaseService {
    completeAttempt = async (
        params: AttemptIdParamsDto,
        callerId: string,
    ): Promise<CompleteAttemptResponseDto> => {
        const attempt = await this._getOwnedAttemptOrThrow(params, callerId);
        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new BadRequestError(
                HomeworkAttemptError.ATTEMPT_ALREADY_COMPLETED,
            );
        }

        const score =
            Math.round(
                (attempt.correctCount / attempt.totalQuestions) * 100 * 100,
            ) / 100;
        const completedAt = new Date();

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.homeworkAttempt.update(
                manager,
                { id: attempt.id },
                { completedAt, score, status: AttemptStatus.COMPLETED },
            );
            await this._upsertUserStat(
                manager,
                callerId,
                attempt.correctCount,
            );
        });

        const updated = await this._getOwnedAttemptOrThrow(params, callerId);
        return this._toSummaryDto(updated);
    };

    getAttemptById = async (
        params: GetAttemptByIdParamsDto,
        callerId: string,
    ): Promise<GetAttemptByIdResponseDto> => {
        const attempt = await this._getOwnedAttemptOrThrow(params, callerId);
        const answers = await this.repositories.homeworkAttemptAnswer.find({
            order: { createdAt: "ASC" },
            where: { attemptId: attempt.id },
        });

        const flashcards = await this._getFlashcardsByIds(
            answers
                .map((answer) => answer.flashcardId)
                .filter((id): id is string => Boolean(id)),
        );

        return {
            ...this._toSummaryDto(attempt),
            answers: answers.map((answer) =>
                this._toAnswerDto(
                    answer,
                    this._expectedAnswerFor(answer, flashcards),
                ),
            ),
        };
    };

    getAttempts = async (
        params: HomeworkIdParamsDto,
        dto: GetAttemptsRequestDto,
        callerId: string,
    ): Promise<GetAttemptsResponseDto> => {
        await this._getOwnedHomeworkOrThrow(params.homeworkId, callerId);

        const result = await this.repositories.homeworkAttempt.paginateKeySet(
            { where: { homeworkId: params.homeworkId, userId: callerId } },
            dto,
        );

        return this._toPaginatedDto(result);
    };

    startAttempt = async (
        params: HomeworkIdParamsDto,
        callerId: string,
    ): Promise<StartAttemptResponseDto> => {
        const homework = await this._getOwnedHomeworkOrThrow(
            params.homeworkId,
            callerId,
        );

        const flashcards = await this.repositories.flashcard.find({
            where: { courseId: homework.courseId },
        });
        const questionCount = homework.questionCount ?? flashcards.length;
        if (questionCount === 0 || questionCount > flashcards.length) {
            throw new BadRequestError(
                HomeworkAttemptError.INSUFFICIENT_FLASHCARDS,
            );
        }

        const selected = this._shuffle(flashcards).slice(0, questionCount);
        const questions = selected.map((flashcard) =>
            this._buildQuestion(flashcard, flashcards, homework),
        );

        const attempt = await AppDataSource.transaction(async (manager) => {
            return this.repositories.homeworkAttempt.create(manager, {
                correctCount: 0,
                homeworkId: homework.id,
                startedAt: new Date(),
                status: AttemptStatus.IN_PROGRESS,
                totalQuestions: questionCount,
                userId: callerId,
            });
        });

        return { attemptId: attempt.id, questions };
    };

    submitAnswer = async (
        params: AttemptIdParamsDto,
        dto: SubmitAnswerRequestDto,
        callerId: string,
    ): Promise<SubmitAnswerResponseDto> => {
        const attempt = await this._getOwnedAttemptOrThrow(params, callerId);
        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new BadRequestError(
                HomeworkAttemptError.ATTEMPT_ALREADY_COMPLETED,
            );
        }

        const flashcard = await this.repositories.flashcard.findOne({
            where: { id: dto.flashcardId },
        });
        if (!flashcard) {
            throw new NotFoundError(FlashcardError.FLASHCARD_NOT_FOUND);
        }

        const expectedAnswer = this._expectedAnswer(flashcard, dto.direction);
        const isCorrect = this._normalize(expectedAnswer) === this._normalize(dto.userAnswer);

        const answer = await AppDataSource.transaction(async (manager) => {
            const created = await this.repositories.homeworkAttemptAnswer.create(
                manager,
                {
                    attemptId: attempt.id,
                    flashcardId: dto.flashcardId,
                    isCorrect,
                    questionDirection: dto.direction,
                    userAnswer: dto.userAnswer,
                },
            );

            if (isCorrect) {
                await this.repositories.homeworkAttempt.update(
                    manager,
                    { id: attempt.id },
                    { correctCount: attempt.correctCount + 1 },
                );
            }

            return created;
        });

        return this._toAnswerDto(answer, expectedAnswer);
    };

    private _buildQuestion = (
        flashcard: FlashcardEntity,
        courseFlashcards: FlashcardEntity[],
        homework: HomeworkEntity,
    ): QuestionDto => {
        const direction = this._resolveDirection(homework.direction);
        const prompt =
            direction === HomeworkDirection.EN_TO_VI
                ? flashcard.wordEn
                : flashcard.wordVi;

        if (homework.type !== HomeworkType.MULTIPLE_CHOICE) {
            return { direction, flashcardId: flashcard.id, prompt };
        }

        const correctAnswer = this._expectedAnswer(flashcard, direction);
        const distractors = this._shuffle(
            courseFlashcards.filter((item) => item.id !== flashcard.id),
        )
            .slice(0, 3)
            .map((item) => this._expectedAnswer(item, direction));

        return {
            direction,
            flashcardId: flashcard.id,
            options: this._shuffle([correctAnswer, ...distractors]),
            prompt,
        };
    };

    private _expectedAnswer = (
        flashcard: FlashcardEntity,
        direction: HomeworkDirection,
    ): string => {
        return direction === HomeworkDirection.EN_TO_VI
            ? flashcard.wordVi
            : flashcard.wordEn;
    };

    private _expectedAnswerFor = (
        answer: HomeworkAttemptAnswerEntity,
        flashcards: Map<string, FlashcardEntity>,
    ): string => {
        if (!answer.flashcardId) return "";
        const flashcard = flashcards.get(answer.flashcardId);
        if (!flashcard) return "";
        return this._expectedAnswer(flashcard, answer.questionDirection);
    };

    private _getFlashcardsByIds = async (
        ids: string[],
    ): Promise<Map<string, FlashcardEntity>> => {
        if (ids.length === 0) return new Map();

        const flashcards = await this.repositories.flashcard.find({
            where: ids.map((id) => ({ id })),
        });
        return new Map(flashcards.map((flashcard) => [flashcard.id, flashcard]));
    };

    private _getOwnedAttemptOrThrow = async (
        params: AttemptIdParamsDto,
        callerId: string,
    ) => {
        const attempt = await this.repositories.homeworkAttempt.findOne({
            where: { homeworkId: params.homeworkId, id: params.attemptId },
        });
        if (!attempt) {
            throw new NotFoundError(HomeworkAttemptError.ATTEMPT_NOT_FOUND);
        }
        if (attempt.userId !== callerId) {
            throw new ForbiddenError(HomeworkAttemptError.ATTEMPT_FORBIDDEN);
        }
        return attempt;
    };

    private _getOwnedHomeworkOrThrow = async (
        homeworkId: string,
        callerId: string,
    ) => {
        const homework = await this.repositories.homework.findOne({
            where: { id: homeworkId },
        });
        if (!homework) {
            throw new NotFoundError(HomeworkError.HOMEWORK_NOT_FOUND);
        }
        if (homework.userId !== callerId) {
            throw new ForbiddenError(HomeworkError.HOMEWORK_FORBIDDEN);
        }
        return homework;
    };

    private _nextStreak = (
        lastActivityDate: Date | string | undefined,
        currentStreak: number,
        today: string,
    ): number => {
        if (!lastActivityDate) return 1;

        const last = this._toDateString(lastActivityDate);
        if (last === today) return currentStreak;

        const yesterday = this._toDateString(
            new Date(Date.now() - 24 * 60 * 60 * 1000),
        );
        return last === yesterday ? currentStreak + 1 : 1;
    };

    private _normalize = (value: string): string => value.trim().toLowerCase();

    private _resolveDirection = (
        configured: HomeworkDirection,
    ): HomeworkDirection => {
        if (configured !== HomeworkDirection.MIXED) return configured;
        return Math.random() < 0.5
            ? HomeworkDirection.EN_TO_VI
            : HomeworkDirection.VI_TO_EN;
    };

    private _shuffle = <T>(items: T[]): T[] => {
        const result = [...items];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };

    private _toAnswerDto = (
        answer: HomeworkAttemptAnswerEntity,
        expectedAnswer: string,
    ): AttemptAnswerResponseDto => {
        return {
            expectedAnswer,
            flashcardId: answer.flashcardId,
            id: answer.id,
            isCorrect: answer.isCorrect,
            questionDirection: answer.questionDirection,
            userAnswer: answer.userAnswer,
        };
    };

    private _toDateString = (date: Date | string): string => {
        const value = typeof date === "string" ? new Date(date) : date;
        return value.toISOString().slice(0, 10);
    };

    private _today = (): string => this._toDateString(new Date());

    private _toPaginatedDto = (
        result: KeySetPaginationResponse<HomeworkAttemptEntity>,
    ): GetAttemptsResponseDto => {
        return {
            ...result,
            items: result.items.map((attempt) => this._toSummaryDto(attempt)),
        };
    };

    private _toSummaryDto = (
        attempt: HomeworkAttemptEntity,
    ): AttemptSummaryResponseDto => {
        return {
            completedAt: attempt.completedAt,
            correctCount: attempt.correctCount,
            id: attempt.id,
            score:
                attempt.score === undefined || attempt.score === null
                    ? undefined
                    : Number(attempt.score),
            startedAt: attempt.startedAt,
            status: attempt.status,
            totalQuestions: attempt.totalQuestions,
        };
    };

    private _upsertUserStat = async (
        manager: EntityManager,
        userId: string,
        correctCount: number,
    ) => {
        const stat = await this.repositories.userStat.findOne({
            where: { userId },
        });
        const today = this._today();

        if (!stat) {
            await this.repositories.userStat.create(manager, {
                currentStreak: 1,
                lastActivityDate: new Date(today),
                longestStreak: 1,
                totalAttemptsCompleted: 1,
                totalCorrectAnswers: correctCount,
                totalPoints: correctCount * POINTS_PER_CORRECT_ANSWER,
                userId,
            });
            return;
        }

        const currentStreak = this._nextStreak(
            stat.lastActivityDate,
            stat.currentStreak,
            today,
        );

        await this.repositories.userStat.update(
            manager,
            { id: stat.id },
            {
                currentStreak,
                lastActivityDate: new Date(today),
                longestStreak: Math.max(stat.longestStreak, currentStreak),
                totalAttemptsCompleted: stat.totalAttemptsCompleted + 1,
                totalCorrectAnswers: stat.totalCorrectAnswers + correctCount,
                totalPoints:
                    stat.totalPoints + correctCount * POINTS_PER_CORRECT_ANSWER,
            },
        );
    };
}

const homeworkAttemptService = new HomeworkAttemptService();
export default homeworkAttemptService;
