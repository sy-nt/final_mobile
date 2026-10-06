import { asyncWrapper } from "@shared/helper/asyncWrapper";
import { authenticator } from "@shared/middlewares/authenticator";
import { validator } from "@shared/middlewares/validator";
import { Router } from "express";

import courseShareController from "../courseShare/courseShare.controller";
import courseController from "./course.controller";
import {
    courseIdParamsSchema,
    createCourseRequestSchema,
    getCourseGalleryRequestSchema,
    getCoursesRequestSchema,
    updateCourseRequestSchema,
} from "./course.schemas";

const courseRouter = Router();

courseRouter.post(
    "/",
    validator({
        body: createCourseRequestSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseController.createCourse),
);

courseRouter.post(
    "/:id/clone",
    validator({
        params: courseIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseShareController.clonePublicCourse),
);

courseRouter.get(
    "/gallery",
    validator({
        query: getCourseGalleryRequestSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseController.getCourseGallery),
);

courseRouter.get(
    "/:id",
    validator({
        params: courseIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseController.getCourseById),
);

courseRouter.get(
    "/",
    validator({
        query: getCoursesRequestSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseController.getCourses),
);

courseRouter.patch(
    "/:id",
    validator({
        body: updateCourseRequestSchema,
        params: courseIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseController.updateCourse),
);

courseRouter.delete(
    "/:id",
    validator({
        params: courseIdParamsSchema,
    }),
    authenticator("access"),
    asyncWrapper(courseController.deleteCourse),
);

export default courseRouter;
