export interface AttachTagRequestDto {
    name: string;
}

export type AttachTagResponseDto = TagResponseDto;

export interface CourseIdParamsDto {
    courseId: string;
}

export interface DetachTagParamsDto {
    courseId: string;
    tagId: string;
}

export interface GetTagsRequestDto {
    search?: string;
}

export type GetTagsResponseDto = TagResponseDto[];

export interface TagResponseDto {
    id: string;
    name: string;
}
