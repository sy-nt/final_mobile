import express from "express";

import authRouter from "./auth/auth.router";
import courseRouter from "./course/course.router";
import adminReportRouter from "./courseReport/adminReport.router";
import courseReportRouter from "./courseReport/courseReport.router";
import courseShareRouter from "./courseShare/courseShare.router";
import shareInviteRouter from "./courseShare/shareInvite.router";
import flashcardRouter from "./flashcard/flashcard.router";
import folderRouter from "./folder/folder.router";
import healthCheckRouter from "./healthCheck/healthCheck.router";
import homeworkRouter from "./homework/homework.router";
import homeworkAttemptRouter from "./homeworkAttempt/homeworkAttempt.router";
import courseTagRouter from "./tag/courseTag.router";
import tagRouter from "./tag/tag.router";
import translateRouter from "./translate/translate.router";
import userRouter from "./user/user.router";
import userStatRouter from "./userStat/userStat.router";

const routerV1 = express.Router();
routerV1.use("/courses/:courseId/flashcards", flashcardRouter);
routerV1.use("/courses/:courseId/tags", courseTagRouter);
routerV1.use("/courses/:courseId/shares", courseShareRouter);
routerV1.use("/courses/:courseId/reports", courseReportRouter);
routerV1.use("/courses", courseRouter);
routerV1.use("/homeworks/:homeworkId/attempts", homeworkAttemptRouter);
routerV1.use("/homeworks", homeworkRouter);
routerV1.use("/tags", tagRouter);
routerV1.use("/folders", folderRouter);
routerV1.use("/shares", shareInviteRouter);
routerV1.use("/me/stats", userStatRouter);
routerV1.use("/admin/reports", adminReportRouter);
routerV1.use("/translate", translateRouter);
routerV1.use("/health_check", healthCheckRouter);
routerV1.use("/auth", authRouter);
routerV1.use("/user", userRouter);

const router = express.Router();
router.use("/v1", routerV1);

export default router;
