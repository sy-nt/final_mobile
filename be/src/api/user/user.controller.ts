import { CreatedResponse, OkResponse } from "@shared/decorators/response";
import { extractRequest } from "@shared/helper/request";
import { extractContext } from "@shared/lib/context";
import { Request } from "express";

import {
    CreateUserRequestDto,
    DeleteUserRequestDto,
    GetUserByIdRequestDto,
    GetUsersRequestDto,
    UpdateUserParamsDto,
    UpdateUserRequestDto,
} from "./user.dto";
import userService from "./user.service";

export class UserController {
    @CreatedResponse()
    async createUser(req: Request) {
        const dto = extractRequest<CreateUserRequestDto>(req, "body");
        return userService.createUser(dto);
    }

    @OkResponse()
    async deleteUser() {
        const { jwtPayload } = extractContext();
        const dto: DeleteUserRequestDto = {
            id: jwtPayload!.userId,
        };

        await userService.deleteUser(dto);
    }

    @OkResponse()
    async getMe() {
        const { jwtPayload } = extractContext();
        return userService.getMe(jwtPayload!.userId);
    }

    @OkResponse()
    async getUserById(req: Request) {
        const dto = extractRequest<GetUserByIdRequestDto>(req, "params");
        return userService.getUserById(dto);
    }

    @OkResponse()
    async getUsers(req: Request) {
        const dto = extractRequest<GetUsersRequestDto>(req, "query");
        return userService.getUsers(dto);
    }

    @OkResponse()
    async updateUser(req: Request) {
        const body = extractRequest<UpdateUserRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        const params: UpdateUserParamsDto = {
            id: jwtPayload!.userId,
        };
        return userService.updateUser(params, body);
    }
}

const userController = new UserController();
export default userController;
