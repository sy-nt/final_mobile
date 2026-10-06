import { CourseError } from "@api/course/course.constants";
import AppDataSource from "@domain/db/postgres";
import { FolderEntity } from "@domain/entities";
import { BaseService } from "@shared/lib/base/service";
import { ForbiddenError, NotFoundError } from "@shared/lib/http/httpError";

import { FolderError } from "./folder.constants";
import {
    AddFolderCourseParamsDto,
    AddFolderCourseRequestDto,
    CreateFolderRequestDto,
    CreateFolderResponseDto,
    FolderIdParamsDto,
    FolderResponseDto,
    GetFoldersResponseDto,
    RemoveFolderCourseParamsDto,
    UpdateFolderParamsDto,
    UpdateFolderRequestDto,
    UpdateFolderResponseDto,
} from "./folder.dto";

export class FolderService extends BaseService {
    addCourse = async (
        params: AddFolderCourseParamsDto,
        dto: AddFolderCourseRequestDto,
        callerId: string,
    ): Promise<void> => {
        await this._getOwnedFolderOrThrow(params.id, callerId);
        const course = await this.repositories.course.findOne({
            where: { id: dto.courseId, ownerId: callerId },
        });
        if (!course) throw new NotFoundError(CourseError.COURSE_NOT_FOUND);

        const existing = await this.repositories.folderCourse.findOne({
            where: { courseId: dto.courseId, folderId: params.id },
        });
        if (existing) return;

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.folderCourse.create(manager, {
                courseId: dto.courseId,
                folderId: params.id,
            });
        });
    };

    createFolder = async (
        dto: CreateFolderRequestDto,
        callerId: string,
    ): Promise<CreateFolderResponseDto> => {
        const folder = await AppDataSource.transaction(async (manager) => {
            return this.repositories.folder.create(manager, {
                name: dto.name,
                userId: callerId,
            });
        });
        return this._toDto(folder);
    };

    deleteFolder = async (
        params: FolderIdParamsDto,
        callerId: string,
    ): Promise<void> => {
        await this._getOwnedFolderOrThrow(params.id, callerId);

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.folder.delete(manager, {
                id: params.id,
            });
        });
    };

    getFolders = async (callerId: string): Promise<GetFoldersResponseDto> => {
        const folders = await this.repositories.folder.find({
            order: { createdAt: "ASC" },
            where: { userId: callerId },
        });
        return folders.map((folder) => this._toDto(folder));
    };

    removeCourse = async (
        params: RemoveFolderCourseParamsDto,
        callerId: string,
    ): Promise<void> => {
        await this._getOwnedFolderOrThrow(params.id, callerId);

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.folderCourse.delete(manager, {
                courseId: params.courseId,
                folderId: params.id,
            });
        });
    };

    updateFolder = async (
        params: UpdateFolderParamsDto,
        dto: UpdateFolderRequestDto,
        callerId: string,
    ): Promise<UpdateFolderResponseDto> => {
        await this._getOwnedFolderOrThrow(params.id, callerId);

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.folder.update(
                manager,
                { id: params.id },
                { name: dto.name },
            );
        });

        const updated = await this.repositories.folder.findOne({
            where: { id: params.id },
        });
        return this._toDto(updated!);
    };

    private _getOwnedFolderOrThrow = async (id: string, callerId: string) => {
        const folder = await this.repositories.folder.findOne({
            where: { id },
        });
        if (!folder) throw new NotFoundError(FolderError.FOLDER_NOT_FOUND);
        if (folder.userId !== callerId) {
            throw new ForbiddenError(FolderError.FOLDER_FORBIDDEN);
        }
        return folder;
    };

    private _toDto = (folder: FolderEntity): FolderResponseDto => {
        return { id: folder.id, name: folder.name };
    };
}

const folderService = new FolderService();
export default folderService;
