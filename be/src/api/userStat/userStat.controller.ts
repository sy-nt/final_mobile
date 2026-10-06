import { OkResponse } from "@shared/decorators/response";
import { extractContext } from "@shared/lib/context";

import userStatService from "./userStat.service";

export class UserStatController {
    @OkResponse()
    async getMyStats() {
        const { jwtPayload } = extractContext();
        return userStatService.getMyStats(jwtPayload!.userId);
    }
}

const userStatController = new UserStatController();
export default userStatController;
