import { asyncWrapper } from "@shared/helper/asyncWrapper";
import express from "express";

import healthCheckController from "./healthCheck.controller";

const healthCheckRouter = express.Router();

healthCheckRouter.get("/", asyncWrapper(healthCheckController.get));

export default healthCheckRouter;
