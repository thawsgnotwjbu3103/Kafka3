import {Sequelize} from "sequelize";
import logging from "./logging";
import dotenv from "dotenv"

dotenv.config()

export const sequelize: Sequelize = new Sequelize(
    process.env.DB_NAME!!,
    process.env.DB_USER!!,
    process.env.DB_PASS!!,
    {
        host: process.env.DB_HOST!!,
        port: process.env.DB_PORT!! as unknown as number,
        dialect: "postgres",
        logging: logging
    }
)