import { HomeworkDirection, HomeworkType } from "@domain/entities";

export interface CreateHomeworkRequestDto {
    courseId: string;
    direction?: HomeworkDirection;
    questionCount?: number;
    title?: string;
    type: HomeworkType;
}

export type CreateHomeworkResponseDto = HomeworkResponseDto;

export interface DeleteHomeworkParamsDto {
    id: string;
}

export interface GetHomeworkByIdParamsDto {
    id: string;
}

export type GetHomeworkByIdResponseDto = HomeworkResponseDto;

export interface GetHomeworksRequestDto {
    courseId?: string;
}

export type GetHomeworksResponseDto = HomeworkResponseDto[];

export interface HomeworkResponseDto {
    courseId: string;
    direction: HomeworkDirection;
    id: string;
    questionCount?: number;
    title?: string;
    type: HomeworkType;
}

export interface UpdateHomeworkParamsDto {
    id: string;
}

export interface UpdateHomeworkRequestDto {
    direction?: HomeworkDirection;
    questionCount?: number;
    title?: string;
}

export type UpdateHomeworkResponseDto = HomeworkResponseDto;
