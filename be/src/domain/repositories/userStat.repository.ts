import { UserStatEntity } from "@domain/entities";

import { BaseRepository } from "./base";

export class UserStatRepository extends BaseRepository<UserStatEntity> {}
const userStatRepository = new UserStatRepository(UserStatEntity);
export default userStatRepository;
