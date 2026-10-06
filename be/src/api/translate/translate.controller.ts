import { OkResponse } from "@shared/decorators/response";
import { extractRequest } from "@shared/helper/request";
import { Request } from "express";

import { SuggestTranslationRequestDto } from "./translate.dto";
import translateService from "./translate.service";

export class TranslateController {
    @OkResponse()
    async suggestTranslation(req: Request) {
        const dto = extractRequest<SuggestTranslationRequestDto>(
            req,
            "query",
        );
        return translateService.suggestTranslation(dto);
    }
}

const translateController = new TranslateController();
export default translateController;
