import { CourseVisibility, ShareStatus, ShareType } from "@domain/entities";

export interface AcceptShareParamsDto {
    shareId: string;
}

export type AcceptShareResponseDto = ClonedCourseResponseDto;

export interface ClonedCourseResponseDto {
    description?: string;
    id: string;
    title: string;
    visibility: CourseVisibility;
}

export interface CourseIdParamsDto {
    courseId: string;
}

export interface CourseShareResponseDto {
    courseId: string;
    id: string;
    sharedWithEmail?: string;
    shareType: ShareType;
    status: ShareStatus;
}

export interface CreateCourseShareRequestDto {
    email?: string;
    shareType: ShareType;
}

export type CreateCourseShareResponseDto = CourseShareResponseDto;

export interface DeleteCourseShareParamsDto {
    courseId: string;
    shareId: string;
}

export type GetCourseSharesResponseDto = CourseShareResponseDto[];

export type GetShareInvitesResponseDto = ShareInviteResponseDto[];

export interface ShareInviteResponseDto {
    courseId: string;
    courseTitle: string;
    id: string;
    sharedByUserId: string;
}
