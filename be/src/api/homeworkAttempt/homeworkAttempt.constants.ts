export const POINTS_PER_CORRECT_ANSWER = 10;

export enum HomeworkAttemptError {
    ATTEMPT_ALREADY_COMPLETED = "This attempt has already been completed",
    ATTEMPT_FORBIDDEN = "You do not have access to this attempt",
    ATTEMPT_NOT_FOUND = "Attempt not found",
    INSUFFICIENT_FLASHCARDS = "The course does not have enough flashcards for this homework",
}
