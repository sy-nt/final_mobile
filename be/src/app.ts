import router from "@api/app.router";
import { handleError, handleNotFound } from "@shared/middlewares/errorHandler";
import { requestTracker } from "@shared/middlewares/requestTracker";
import cors from "cors";
import express, { ErrorRequestHandler } from "express";
import morgan from "morgan";
import "@domain/db";

const app = express();

app.use(express.json());
app.use(requestTracker);

morgan.token("request-time", () => {
    return new Date().toISOString();
});

app.use(cors({
    origin: "*",
}));

app.use(
    morgan(
        ":request-time :method :url :status :res[content-length] - :response-time ms",
    ),
);

app.use("/api", router);
app.use(handleNotFound);

app.use(handleError as unknown as ErrorRequestHandler);

export default app;
