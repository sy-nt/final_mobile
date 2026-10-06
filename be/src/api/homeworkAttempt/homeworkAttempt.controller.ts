import { CreatedResponse, OkResponse } from "@shared/decorators/response";
import { extractRequest } from "@shared/helper/request";
import { extractContext } from "@shared/lib/context";
import { Request } from "express";

import {
    AttemptIdParamsDto,
    GetAttemptByIdParamsDto,
    GetAttemptsRequestDto,
    HomeworkIdParamsDto,
    SubmitAnswerRequestDto,
} from "./homeworkAttempt.dto";
import homeworkAttemptService from "./homeworkAttempt.service";

export class HomeworkAttemptController {
    @OkResponse()
    async completeAttempt(req: Request) {
        const params = extractRequest<AttemptIdParamsDto>(req, "params");
        const { jwtPayload } = extractContext();
        return homeworkAttemptService.completeAttempt(
            params,
            jwtPayload!.userId,
        );
    }

    @OkResponse()
    async getAttemptById(req: Request) {
        const params = extractRequest<GetAttemptByIdParamsDto>(
            req,
            "params",
        );
        const { jwtPayload } = extractContext();
        return homeworkAttemptService.getAttemptById(
            params,
            jwtPayload!.userId,
        );
    }

    @OkResponse()
    async getAttempts(req: Request) {
        const params = extractRequest<HomeworkIdParamsDto>(req, "params");
        const dto = extractRequest<GetAttemptsRequestDto>(req, "query");
        const { jwtPayload } = extractContext();
        return homeworkAttemptService.getAttempts(
            params,
            dto,
            jwtPayload!.userId,
        );
    }

    @CreatedResponse()
    async startAttempt(req: Request) {
        const params = extractRequest<HomeworkIdParamsDto>(req, "params");
        const { jwtPayload } = extractContext();
        return homeworkAttemptService.startAttempt(
            params,
            jwtPayload!.userId,
        );
    }

    @CreatedResponse()
    async submitAnswer(req: Request) {
        const params = extractRequest<AttemptIdParamsDto>(req, "params");
        const dto = extractRequest<SubmitAnswerRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        return homeworkAttemptService.submitAnswer(
            params,
            dto,
            jwtPayload!.userId,
        );
    }
}

const homeworkAttemptController = new HomeworkAttemptController();
export default homeworkAttemptController;
