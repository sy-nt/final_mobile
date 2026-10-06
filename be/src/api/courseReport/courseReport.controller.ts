import { CreatedResponse, OkResponse } from "@shared/decorators/response";
import { extractRequest } from "@shared/helper/request";
import { extractContext } from "@shared/lib/context";
import { Request } from "express";

import {
    CourseIdParamsDto,
    CreateCourseReportRequestDto,
    GetReportsRequestDto,
    ReportIdParamsDto,
    UpdateReportRequestDto,
} from "./courseReport.dto";
import courseReportService from "./courseReport.service";

export class CourseReportController {
    @CreatedResponse()
    async createReport(req: Request) {
        const { courseId } = extractRequest<CourseIdParamsDto>(req, "params");
        const dto = extractRequest<CreateCourseReportRequestDto>(
            req,
            "body",
        );
        const { jwtPayload } = extractContext();
        return courseReportService.createReport(
            courseId,
            dto,
            jwtPayload!.userId,
        );
    }

    @OkResponse()
    async getReports(req: Request) {
        const dto = extractRequest<GetReportsRequestDto>(req, "query");
        const { jwtPayload } = extractContext();
        return courseReportService.getReports(dto, jwtPayload!.userId);
    }

    @OkResponse()
    async updateReport(req: Request) {
        const params = extractRequest<ReportIdParamsDto>(req, "params");
        const dto = extractRequest<UpdateReportRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        return courseReportService.updateReport(
            params,
            dto,
            jwtPayload!.userId,
        );
    }
}

const courseReportController = new CourseReportController();
export default courseReportController;
