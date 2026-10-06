import { AttemptStatus, HomeworkDirection } from "@domain/entities";
import { KeySetPaginationDto, KeySetPaginationResponse } from "@shared/types";

export interface AttemptAnswerResponseDto {
    expectedAnswer: string;
    flashcardId?: string;
    id: string;
    isCorrect: boolean;
    questionDirection: HomeworkDirection;
    userAnswer: string;
}

export interface AttemptDetailResponseDto extends AttemptSummaryResponseDto {
    answers: AttemptAnswerResponseDto[];
}

export interface AttemptIdParamsDto {
    attemptId: string;
    homeworkId: string;
}

export interface AttemptSummaryResponseDto {
    completedAt?: Date;
    correctCount: number;
    id: string;
    score?: number;
    startedAt: Date;
    status: AttemptStatus;
    totalQuestions: number;
}

export type CompleteAttemptResponseDto = AttemptSummaryResponseDto;

export interface GetAttemptByIdParamsDto {
    attemptId: string;
    homeworkId: string;
}

export type GetAttemptByIdResponseDto = AttemptDetailResponseDto;

export type GetAttemptsRequestDto = KeySetPaginationDto;

export type GetAttemptsResponseDto =
    KeySetPaginationResponse<AttemptSummaryResponseDto>;

export interface HomeworkIdParamsDto {
    homeworkId: string;
}

export interface QuestionDto {
    direction: HomeworkDirection;
    flashcardId: string;
    options?: string[];
    prompt: string;
}

export interface StartAttemptResponseDto {
    attemptId: string;
    questions: QuestionDto[];
}

export interface SubmitAnswerRequestDto {
    direction: HomeworkDirection;
    flashcardId: string;
    userAnswer: string;
}

export type SubmitAnswerResponseDto = AttemptAnswerResponseDto;
