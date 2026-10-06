import { CourseVisibility } from "@domain/entities";
import { KeySetPaginationDto, KeySetPaginationResponse } from "@shared/types";

export interface CourseResponseDto {
    cloneCount: number;
    description?: string;
    id: string;
    isOwner: boolean;
    tags: string[];
    title: string;
    visibility: CourseVisibility;
}

export interface CreateCourseRequestDto {
    description?: string;
    title: string;
}

export type CreateCourseResponseDto = CourseResponseDto;

export interface DeleteCourseParamsDto {
    id: string;
}

export interface GetCourseByIdParamsDto {
    id: string;
}

export type GetCourseByIdResponseDto = CourseResponseDto;

export interface GetCourseGalleryRequestDto extends KeySetPaginationDto {
    tag?: string;
    title?: string;
}

export type GetCourseGalleryResponseDto =
    KeySetPaginationResponse<CourseResponseDto>;

export interface GetCoursesRequestDto extends KeySetPaginationDto {
    folderId?: string;
}

export type GetCoursesResponseDto = KeySetPaginationResponse<CourseResponseDto>;

export interface UpdateCourseParamsDto {
    id: string;
}

export interface UpdateCourseRequestDto {
    description?: string;
    title?: string;
    visibility?: CourseVisibility;
}

export type UpdateCourseResponseDto = CourseResponseDto;
