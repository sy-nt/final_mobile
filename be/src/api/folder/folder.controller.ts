import { CreatedResponse, OkResponse } from "@shared/decorators/response";
import { extractRequest } from "@shared/helper/request";
import { extractContext } from "@shared/lib/context";
import { Request } from "express";

import {
    AddFolderCourseParamsDto,
    AddFolderCourseRequestDto,
    CreateFolderRequestDto,
    FolderIdParamsDto,
    RemoveFolderCourseParamsDto,
    UpdateFolderParamsDto,
    UpdateFolderRequestDto,
} from "./folder.dto";
import folderService from "./folder.service";

export class FolderController {
    @CreatedResponse()
    async addCourse(req: Request) {
        const params = extractRequest<AddFolderCourseParamsDto>(
            req,
            "params",
        );
        const dto = extractRequest<AddFolderCourseRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        await folderService.addCourse(params, dto, jwtPayload!.userId);
    }

    @CreatedResponse()
    async createFolder(req: Request) {
        const dto = extractRequest<CreateFolderRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        return folderService.createFolder(dto, jwtPayload!.userId);
    }

    @OkResponse()
    async deleteFolder(req: Request) {
        const params = extractRequest<FolderIdParamsDto>(req, "params");
        const { jwtPayload } = extractContext();
        await folderService.deleteFolder(params, jwtPayload!.userId);
    }

    @OkResponse()
    async getFolders() {
        const { jwtPayload } = extractContext();
        return folderService.getFolders(jwtPayload!.userId);
    }

    @OkResponse()
    async removeCourse(req: Request) {
        const params = extractRequest<RemoveFolderCourseParamsDto>(
            req,
            "params",
        );
        const { jwtPayload } = extractContext();
        await folderService.removeCourse(params, jwtPayload!.userId);
    }

    @OkResponse()
    async updateFolder(req: Request) {
        const params = extractRequest<UpdateFolderParamsDto>(req, "params");
        const body = extractRequest<UpdateFolderRequestDto>(req, "body");
        const { jwtPayload } = extractContext();
        return folderService.updateFolder(params, body, jwtPayload!.userId);
    }
}

const folderController = new FolderController();
export default folderController;
