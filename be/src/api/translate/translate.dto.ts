export interface SuggestTranslationRequestDto {
    from: TranslateLanguage;
    text: string;
}

export interface SuggestTranslationResponseDto {
    translation: null | string;
}

export type TranslateLanguage = "en" | "vi";
