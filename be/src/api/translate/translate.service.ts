import config from "@config/index";
import { BaseService } from "@shared/lib/base/service";

import {
    GOOGLE_TRANSLATE_ENDPOINT,
    TRANSLATE_CACHE_TTL_SECONDS,
} from "./translate.constants";
import {
    SuggestTranslationRequestDto,
    SuggestTranslationResponseDto,
    TranslateLanguage,
} from "./translate.dto";

export class TranslateService extends BaseService {
    suggestTranslation = async (
        dto: SuggestTranslationRequestDto,
    ): Promise<SuggestTranslationResponseDto> => {
        const normalizedText = dto.text.trim().toLowerCase();
        const cacheKey = this._buildCacheKey(dto.from, normalizedText);

        const cached = await this.redis.get(cacheKey);
        if (cached !== null) return { translation: cached };

        const translation = await this._fetchTranslation(dto.from, dto.text);
        if (translation !== null) {
            await this.redis.set(
                cacheKey,
                translation,
                "EX",
                TRANSLATE_CACHE_TTL_SECONDS,
            );
        }

        return { translation };
    };

    private _buildCacheKey = (
        from: TranslateLanguage,
        text: string,
    ): string => {
        return `translate:${from}:${text}`;
    };

    private _fetchTranslation = async (
        from: TranslateLanguage,
        text: string,
    ): Promise<null | string> => {
        if (!config.googleTranslateApiKey) return null;

        try {
            const to: TranslateLanguage = from === "en" ? "vi" : "en";
            const url = new URL(GOOGLE_TRANSLATE_ENDPOINT);
            url.searchParams.set("key", config.googleTranslateApiKey);
            url.searchParams.set("q", text);
            url.searchParams.set("source", from);
            url.searchParams.set("target", to);

            const response = await fetch(url.toString(), { method: "POST" });
            if (!response.ok) return null;

            const body = await response.json();
            return body?.data?.translations?.[0]?.translatedText ?? null;
        } catch (error) {
            this.logger.warn("Google Translate request failed", { error });
            return null;
        }
    };
}

const translateService = new TranslateService();
export default translateService;
