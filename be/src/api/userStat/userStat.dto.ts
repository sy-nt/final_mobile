export interface UserStatResponseDto {
    currentStreak: number;
    lastActivityDate?: Date;
    longestStreak: number;
    totalAttemptsCompleted: number;
    totalCorrectAnswers: number;
    totalPoints: number;
}
