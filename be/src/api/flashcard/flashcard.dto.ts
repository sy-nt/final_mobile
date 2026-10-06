export interface BulkCreateFlashcardRequestDto {
    flashcards: CreateFlashcardRequestDto[];
}

export type BulkCreateFlashcardResponseDto = FlashcardResponseDto[];

export interface CourseIdParamsDto {
    courseId: string;
}

export interface CreateFlashcardRequestDto {
    example?: string;
    wordEn: string;
    wordVi: string;
}

export type CreateFlashcardResponseDto = FlashcardResponseDto;

export interface DeleteFlashcardParamsDto {
    courseId: string;
    id: string;
}

export interface FlashcardResponseDto {
    example?: string;
    id: string;
    position: number;
    wordEn: string;
    wordVi: string;
}

export type GetFlashcardsResponseDto = FlashcardResponseDto[];

export interface UpdateFlashcardParamsDto {
    courseId: string;
    id: string;
}

export interface UpdateFlashcardRequestDto {
    example?: string;
    position?: number;
    wordEn?: string;
    wordVi?: string;
}

export type UpdateFlashcardResponseDto = FlashcardResponseDto;
