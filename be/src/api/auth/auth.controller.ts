import { OkResponse } from "@shared/decorators/response";
import { extractRequest } from "@shared/helper/request";
import { extractContext } from "@shared/lib/context";
import { Request } from "express";

import { LoginRequestDto } from "./auth.dto";
import authService from "./auth.service";

export class AuthController {
    @OkResponse()
    async login(req: Request) {
        const dto = extractRequest<LoginRequestDto>(req, "body");
        return authService.login(dto);
    }

    @OkResponse()
    async refresh() {
        const { jwtPayload } = extractContext();
        return authService.refresh(jwtPayload!.userId);
    }
}

const authController = new AuthController();
export default authController;
