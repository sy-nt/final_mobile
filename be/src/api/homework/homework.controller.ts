import { CreatedResponse, OkResponse } from "@shared/decorators/response";
import { extractRequest } from "@shared/helper/request";
import { extractContext } from "@shared/lib/context";
import { Request } from "express";

import {
    CreateHomeworkRequestDto,
    DeleteHomeworkParamsDto,
    GetHomeworkByIdParamsDto,
    GetHomeworksRequestDto,
    UpdateHomeworkParamsDto,
    UpdateHomeworkRequestDto,
} from "./homework.dto";
import homeworkService from "./homework.service";

export class HomeworkController {
    @CreatedResponse()
    async createHomework(req: Request) {
        const dto = extractRequest<CreateHomeworkRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        return homeworkService.createHomework(dto, jwtPayload!.userId);
    }

    @OkResponse()
    async deleteHomework(req: Request) {
        const params = extractRequest<DeleteHomeworkParamsDto>(req, "params");
        const { jwtPayload } = extractContext();
        await homeworkService.deleteHomework(params, jwtPayload!.userId);
    }

    @OkResponse()
    async getHomeworkById(req: Request) {
        const params = extractRequest<GetHomeworkByIdParamsDto>(
            req,
            "params",
        );
        const { jwtPayload } = extractContext();
        return homeworkService.getHomeworkById(params, jwtPayload!.userId);
    }

    @OkResponse()
    async getHomeworks(req: Request) {
        const dto = extractRequest<GetHomeworksRequestDto>(req, "query");
        const { jwtPayload } = extractContext();
        return homeworkService.getHomeworks(dto, jwtPayload!.userId);
    }

    @OkResponse()
    async updateHomework(req: Request) {
        const params = extractRequest<UpdateHomeworkParamsDto>(req, "params");
        const dto = extractRequest<UpdateHomeworkRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        return homeworkService.updateHomework(
            params,
            dto,
            jwtPayload!.userId,
        );
    }
}

const homeworkController = new HomeworkController();
export default homeworkController;
