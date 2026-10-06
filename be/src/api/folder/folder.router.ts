import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import folderController from "./folder.controller";
import {
    addFolderCourseRequestSchema,
    createFolderRequestSchema,
    folderIdParamsSchema,
    removeFolderCourseParamsSchema,
    updateFolderRequestSchema,
} from "./folder.schemas";

const folderRouter = Router();

folderRouter.post(
    "/",
    validator({
        body: createFolderRequestSchema,
    }),
    authenticator("access"),
    asyncWrapper(folderController.createFolder),
);

folderRouter.get(
    "/",
    authenticator("access"),
    asyncWrapper(folderController.getFolders),
);

folderRouter.patch(
    "/:id",
    validator({
        body: updateFolderRequestSchema,
        params: folderIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(folderController.updateFolder),
);

folderRouter.delete(
    "/:id",
    validator({
        params: folderIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(folderController.deleteFolder),
);

folderRouter.post(
    "/:id/courses",
    validator({
        body: addFolderCourseRequestSchema,
        params: folderIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(folderController.addCourse),
);

folderRouter.delete(
    "/:id/courses/:courseId",
    validator({
        params: removeFolderCourseParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(folderController.removeCourse),
);

export default folderRouter;
