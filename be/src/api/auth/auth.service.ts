import AppDataSource from "@domain/db/postgres";
import { BaseService } from "@shared/lib/base/service";
import { UnauthorizedError } from "@shared/lib/http/httpError";
import jwt from "@shared/lib/jwt";
import bcrypt from "bcrypt";

import { AuthError } from "./auth.constants";
import {
    AuthSessionResponseDto,
    LoginRequestDto,
    LoginResponseDto,
    RefreshResponseDto,
} from "./auth.dto";

export class AuthService extends BaseService {
    login = async (dto: LoginRequestDto): Promise<LoginResponseDto> => {
        const user = await this.repositories.user.findOne({
            where: { email: dto.email },
        });
        if (!user) {
            throw new UnauthorizedError(AuthError.INVALID_CREDENTIALS);
        }

        const matches = await bcrypt.compare(dto.password, user.password);
        if (!matches) {
            throw new UnauthorizedError(AuthError.INVALID_CREDENTIALS);
        }

        await AppDataSource.transaction(async (manager) => {
            await this.repositories.user.update(
                manager,
                { id: user.id },
                { lastLoginAt: new Date() },
            );
        });

        return this._toSession(user);
    };

    refresh = async (userId: string): Promise<RefreshResponseDto> => {
        const user = await this.repositories.user.findOne({
            select: { email: true, firstName: true, id: true, lastName: true },
            where: { id: userId },
        });
        if (!user) throw new UnauthorizedError(AuthError.INVALID_CREDENTIALS);

        return this._toSession(user);
    };

    private _toSession = async (user: {
        email: string;
        firstName: string;
        id: string;
        lastName: string;
    }): Promise<AuthSessionResponseDto> => {
        const tokens = await jwt.generateTokens({ userId: user.id });
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                email: user.email,
                firstName: user.firstName,
                id: user.id,
                lastName: user.lastName,
            },
        };
    };
}

const authService = new AuthService();
export default authService;
