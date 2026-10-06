import AppDataSource from "@domain/db/postgres";
import { UserStatEntity } from "@domain/entities";
import { BaseService } from "@shared/lib/base/service";

import { UserStatResponseDto } from "./userStat.dto";

export class UserStatService extends BaseService {
    getMyStats = async (callerId: string): Promise<UserStatResponseDto> => {
        const stat = await this._getOrCreateStat(callerId);
        return this._toDto(stat);
    };

    private _getOrCreateStat = async (userId: string) => {
        const existing = await this.repositories.userStat.findOne({
            where: { userId },
        });
        if (existing) return existing;

        return AppDataSource.transaction(async (manager) => {
            return this.repositories.userStat.create(manager, {
                currentStreak: 0,
                longestStreak: 0,
                totalAttemptsCompleted: 0,
                totalCorrectAnswers: 0,
                totalPoints: 0,
                userId,
            });
        });
    };

    private _toDto = (stat: UserStatEntity): UserStatResponseDto => {
        return {
            currentStreak: stat.currentStreak,
            lastActivityDate: stat.lastActivityDate,
            longestStreak: stat.longestStreak,
            totalAttemptsCompleted: stat.totalAttemptsCompleted,
            totalCorrectAnswers: stat.totalCorrectAnswers,
            totalPoints: stat.totalPoints,
        };
    };
}

const userStatService = new UserStatService();
export default userStatService;
