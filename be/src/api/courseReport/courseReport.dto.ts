import { ReportReason, ReportStatus } from "@domain/entities";
import { KeySetPaginationDto, KeySetPaginationResponse } from "@shared/types";

export interface CourseIdParamsDto {
    courseId: string;
}

export interface CourseReportResponseDto {
    courseId: string;
    detail?: string;
    id: string;
    reason: ReportReason;
    reportedByUserId: string;
    reviewedByUserId?: string;
    reviewNote?: string;
    status: ReportStatus;
}

export interface CreateCourseReportRequestDto {
    detail?: string;
    reason: ReportReason;
}

export type CreateCourseReportResponseDto = CourseReportResponseDto;

export interface GetReportsRequestDto extends KeySetPaginationDto {
    status?: ReportStatus;
}

export type GetReportsResponseDto =
    KeySetPaginationResponse<CourseReportResponseDto>;

export interface ReportIdParamsDto {
    id: string;
}

export interface UpdateReportRequestDto {
    note?: string;
    status: ReportStatus;
}

export type UpdateReportResponseDto = CourseReportResponseDto;
