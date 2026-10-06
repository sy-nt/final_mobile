import { CreatedResponse, OkResponse } from "@shared/decorators/response";
import { extractRequest } from "@shared/helper/request";
import { extractContext } from "@shared/lib/context";
import { Request } from "express";

import {
    CreateCourseRequestDto,
    DeleteCourseParamsDto,
    GetCourseByIdParamsDto,
    GetCourseGalleryRequestDto,
    GetCoursesRequestDto,
    UpdateCourseParamsDto,
    UpdateCourseRequestDto,
} from "./course.dto";
import courseService from "./course.service";

export class CourseController {
    @CreatedResponse()
    async createCourse(req: Request) {
        const dto = extractRequest<CreateCourseRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        return courseService.createCourse(dto, jwtPayload!.userId);
    }

    @OkResponse()
    async deleteCourse(req: Request) {
        const params = extractRequest<DeleteCourseParamsDto>(req, "params");
        const { jwtPayload } = extractContext();
        await courseService.deleteCourse(params, jwtPayload!.userId);
    }

    @OkResponse()
    async getCourseById(req: Request) {
        const params = extractRequest<GetCourseByIdParamsDto>(req, "params");
        const { jwtPayload } = extractContext();
        return courseService.getCourseById(params, jwtPayload!.userId);
    }

    @OkResponse()
    async getCourseGallery(req: Request) {
        const dto = extractRequest<GetCourseGalleryRequestDto>(req, "query");
        const { jwtPayload } = extractContext();
        return courseService.getCourseGallery(dto, jwtPayload!.userId);
    }

    @OkResponse()
    async getCourses(req: Request) {
        const dto = extractRequest<GetCoursesRequestDto>(req, "query");
        const { jwtPayload } = extractContext();
        return courseService.getCourses(dto, jwtPayload!.userId);
    }

    @OkResponse()
    async updateCourse(req: Request) {
        const params = extractRequest<UpdateCourseParamsDto>(req, "params");
        const body = extractRequest<UpdateCourseRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        return courseService.updateCourse(params, body, jwtPayload!.userId);
    }
}

const courseController = new CourseController();
export default courseController;
