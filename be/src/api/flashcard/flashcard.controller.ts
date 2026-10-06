import { CreatedResponse, OkResponse } from "@shared/decorators/response";
import { extractRequest } from "@shared/helper/request";
import { extractContext } from "@shared/lib/context";
import { Request } from "express";

import {
    BulkCreateFlashcardRequestDto,
    CourseIdParamsDto,
    CreateFlashcardRequestDto,
    DeleteFlashcardParamsDto,
    UpdateFlashcardParamsDto,
    UpdateFlashcardRequestDto,
} from "./flashcard.dto";
import flashcardService from "./flashcard.service";

export class FlashcardController {
    @CreatedResponse()
    async bulkCreateFlashcards(req: Request) {
        const { courseId } = extractRequest<CourseIdParamsDto>(req, "params");
        const dto = extractRequest<BulkCreateFlashcardRequestDto>(
            req,
            "body",
        );
        const { jwtPayload } = extractContext();
        return flashcardService.bulkCreateFlashcards(
            courseId,
            dto,
            jwtPayload!.userId,
        );
    }

    @CreatedResponse()
    async createFlashcard(req: Request) {
        const { courseId } = extractRequest<CourseIdParamsDto>(req, "params");
        const dto = extractRequest<CreateFlashcardRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        return flashcardService.createFlashcard(
            courseId,
            dto,
            jwtPayload!.userId,
        );
    }

    @OkResponse()
    async deleteFlashcard(req: Request) {
        const params = extractRequest<DeleteFlashcardParamsDto>(
            req,
            "params",
        );
        const { jwtPayload } = extractContext();
        await flashcardService.deleteFlashcard(params, jwtPayload!.userId);
    }

    @OkResponse()
    async getFlashcards(req: Request) {
        const { courseId } = extractRequest<CourseIdParamsDto>(req, "params");
        const { jwtPayload } = extractContext();
        return flashcardService.getFlashcards(courseId, jwtPayload!.userId);
    }

    @OkResponse()
    async updateFlashcard(req: Request) {
        const params = extractRequest<UpdateFlashcardParamsDto>(
            req,
            "params",
        );
        const body = extractRequest<UpdateFlashcardRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        return flashcardService.updateFlashcard(
            params,
            body,
            jwtPayload!.userId,
        );
    }
}

const flashcardController = new FlashcardController();
export default flashcardController;
