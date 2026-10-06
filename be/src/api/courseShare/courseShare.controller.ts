import { CreatedResponse, OkResponse } from "@shared/decorators/response";
import { extractRequest } from "@shared/helper/request";
import { extractContext } from "@shared/lib/context";
import { Request } from "express";

import {
    AcceptShareParamsDto,
    CourseIdParamsDto,
    CreateCourseShareRequestDto,
    DeleteCourseShareParamsDto,
} from "./courseShare.dto";
import courseShareService from "./courseShare.service";

export class CourseShareController {
    @CreatedResponse()
    async acceptShare(req: Request) {
        const params = extractRequest<AcceptShareParamsDto>(req, "params");
        const { jwtPayload } = extractContext();
        return courseShareService.acceptShare(params, jwtPayload!.userId);
    }

    @CreatedResponse()
    async clonePublicCourse(req: Request) {
        const { id } = extractRequest<{ id: string }>(req, "params");
        const { jwtPayload } = extractContext();
        return courseShareService.clonePublicCourse(id, jwtPayload!.userId);
    }

    @CreatedResponse()
    async createShare(req: Request) {
        const { courseId } = extractRequest<CourseIdParamsDto>(req, "params");
        const dto = extractRequest<CreateCourseShareRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        return courseShareService.createShare(
            courseId,
            dto,
            jwtPayload!.userId,
        );
    }

    @OkResponse()
    async getInvites() {
        const { jwtPayload } = extractContext();
        return courseShareService.getInvites(jwtPayload!.userId);
    }

    @OkResponse()
    async getShares(req: Request) {
        const { courseId } = extractRequest<CourseIdParamsDto>(req, "params");
        const { jwtPayload } = extractContext();
        return courseShareService.getShares(courseId, jwtPayload!.userId);
    }

    @OkResponse()
    async revokeShare(req: Request) {
        const params = extractRequest<DeleteCourseShareParamsDto>(
            req,
            "params",
        );
        const { jwtPayload } = extractContext();
        await courseShareService.revokeShare(params, jwtPayload!.userId);
    }
}

const courseShareController = new CourseShareController();
export default courseShareController;
