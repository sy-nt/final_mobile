export interface AuthSessionResponseDto {
    accessToken: string;
    refreshToken: string;
    user: AuthUserResponseDto;
}

export interface AuthUserResponseDto {
    email: string;
    firstName: string;
    id: string;
    lastName: string;
}

export interface LoginRequestDto {
    email: string;
    password: string;
}

export type LoginResponseDto = AuthSessionResponseDto;

export type RefreshResponseDto = AuthSessionResponseDto;
