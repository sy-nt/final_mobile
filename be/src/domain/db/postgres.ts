import config from "@config/index";
import appLogger from "@shared/lib/logger";
import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
    ...config.db.postgres,
    entities: [__dirname + "/../entities/*.entity.{ts,js}"],
    migrations: [__dirname + "/../migrations/*.{ts,js}"],
    synchronize: false,
    type: "postgres",
});

AppDataSource.initialize()
    .then(() => {
        appLogger.info("Database initialized");
    })
    .catch((error) => {
        appLogger.error("Error initializing database", error);
    });

export default AppDataSource;
