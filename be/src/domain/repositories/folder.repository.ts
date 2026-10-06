import { FolderEntity } from "@domain/entities";

import { BaseRepository } from "./base";

export class FolderRepository extends BaseRepository<FolderEntity> {}
const folderRepository = new FolderRepository(FolderEntity);
export default folderRepository;
