import { CreatedResponse, OkResponse } from "@shared/decorators/response";
import { extractRequest } from "@shared/helper/request";
import { extractContext } from "@shared/lib/context";
import { Request } from "express";

import {
    AttachTagRequestDto,
    CourseIdParamsDto,
    DetachTagParamsDto,
    GetTagsRequestDto,
} from "./tag.dto";
import tagService from "./tag.service";

export class TagController {
    @CreatedResponse()
    async attachTag(req: Request) {
        const { courseId } = extractRequest<CourseIdParamsDto>(req, "params");
        const dto = extractRequest<AttachTagRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        return tagService.attachTag(courseId, dto, jwtPayload!.userId);
    }

    @OkResponse()
    async detachTag(req: Request) {
        const params = extractRequest<DetachTagParamsDto>(req, "params");
        const { jwtPayload } = extractContext();
        await tagService.detachTag(params, jwtPayload!.userId);
    }

    @OkResponse()
    async getCourseTags(req: Request) {
        const { courseId } = extractRequest<CourseIdParamsDto>(req, "params");
        const { jwtPayload } = extractContext();
        return tagService.getCourseTags(courseId, jwtPayload!.userId);
    }

    @OkResponse()
    async getTags(req: Request) {
        const dto = extractRequest<GetTagsRequestDto>(req, "query");
        return tagService.getTags(dto);
    }
}

const tagController = new TagController();
export default tagController;
