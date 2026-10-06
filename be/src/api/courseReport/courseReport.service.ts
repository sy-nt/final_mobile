import { CourseError } from "@api/course/course.constants";
import AppDataSource from "@domain/db/postgres";
import {
    CourseReportEntity,
    ReportStatus,
    ShareStatus,
    ShareType,
    UserRole,
} from "@domain/entities";
import { BaseService } from "@shared/lib/base/service";
import { ForbiddenError, NotFoundError } from "@shared/lib/http/httpError";
import { removeNil } from "@shared/utils/object";

import { CourseReportError } from "./courseReport.constants";
import {
    CourseReportResponseDto,
    CreateCourseReportRequestDto,
    CreateCourseReportResponseDto,
    GetReportsRequestDto,
    GetReportsResponseDto,
    ReportIdParamsDto,
    UpdateReportRequestDto,
    UpdateReportResponseDto,
} from "./courseReport.dto";

export class CourseReportService extends BaseService {
    createReport = async (
        courseId: string,
        dto: CreateCourseReportRequestDto,
        callerId: string,
    ): Promise<CreateCourseReportResponseDto> => {
        await this._assertCourseReportable(courseId);

        const report = await AppDataSource.transaction(async (manager) => {
            return this.repositories.courseReport.create(manager, {
                courseId,
                detail: dto.detail,
                reason: dto.reason,
                reportedByUserId: callerId,
            });
        });

        return this._toDto(report);
    };

    getReports = async (
        dto: GetReportsRequestDto,
        callerId: string,
    ): Promise<GetReportsResponseDto> => {
        await this._assertAdmin(callerId);

        const result = await this.repositories.courseReport.paginateKeySet(
            { where: dto.status ? { status: dto.status } : {} },
            dto,
        );

        return {
            ...result,
            items: result.items.map((report) => this._toDto(report)),
        };
    };

    updateReport = async (
        params: ReportIdParamsDto,
        dto: UpdateReportRequestDto,
        callerId: string,
    ): Promise<UpdateReportResponseDto> => {
        await this._assertAdmin(callerId);
        const report = await this._getReportOrThrow(params.id);

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.courseReport.update(
                manager,
                { id: params.id },
                removeNil({
                    reviewedByUserId: callerId,
                    reviewNote: dto.note,
                    status: dto.status,
                }),
            );

            if (dto.status === ReportStatus.ACTION_TAKEN) {
                await this.repositories.course.update(
                    manager,
                    { id: report.courseId },
                    { isSuspended: true },
                );
            }
        });

        const updated = await this._getReportOrThrow(params.id);
        return this._toDto(updated);
    };

    private _assertAdmin = async (callerId: string) => {
        const user = await this.repositories.user.findOne({
            where: { id: callerId },
        });
        if (!user || user.role !== UserRole.ADMIN) {
            throw new ForbiddenError(CourseReportError.ADMIN_ONLY);
        }
    };

    private _assertCourseReportable = async (courseId: string) => {
        const course = await this.repositories.course.findOne({
            where: { id: courseId },
        });
        if (!course) throw new NotFoundError(CourseError.COURSE_NOT_FOUND);

        const share = await this.repositories.courseShare.findOne({
            where: {
                courseId,
                shareType: ShareType.ALL,
                status: ShareStatus.ACTIVE,
            },
        });
        if (!share) {
            throw new ForbiddenError(CourseReportError.COURSE_NOT_REPORTABLE);
        }
    };

    private _getReportOrThrow = async (id: string) => {
        const report = await this.repositories.courseReport.findOne({
            where: { id },
        });
        if (!report) {
            throw new NotFoundError(CourseReportError.REPORT_NOT_FOUND);
        }
        return report;
    };

    private _toDto = (report: CourseReportEntity): CourseReportResponseDto => {
        return {
            courseId: report.courseId,
            detail: report.detail,
            id: report.id,
            reason: report.reason,
            reportedByUserId: report.reportedByUserId,
            reviewedByUserId: report.reviewedByUserId,
            reviewNote: report.reviewNote,
            status: report.status,
        };
    };
}

const courseReportService = new CourseReportService();
export default courseReportService;
