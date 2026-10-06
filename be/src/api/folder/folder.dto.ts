export interface AddFolderCourseParamsDto {
    id: string;
}

export interface AddFolderCourseRequestDto {
    courseId: string;
}

export interface CreateFolderRequestDto {
    name: string;
}

export type CreateFolderResponseDto = FolderResponseDto;

export interface FolderIdParamsDto {
    id: string;
}

export interface FolderResponseDto {
    id: string;
    name: string;
}

export type GetFoldersResponseDto = FolderResponseDto[];

export interface RemoveFolderCourseParamsDto {
    courseId: string;
    id: string;
}

export interface UpdateFolderParamsDto {
    id: string;
}

export interface UpdateFolderRequestDto {
    name: string;
}

export type UpdateFolderResponseDto = FolderResponseDto;
