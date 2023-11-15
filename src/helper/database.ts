import {Sequelize} from "sequelize";

import * as path from "path"
import * as url from "url"
import logging from "./logging";
const __filename: string = url.fileURLToPath(import.meta.url)
const __dirname: string = path.dirname(__filename)

const dbPath: string = path.resolve(__dirname, "../../database.sqlite")
export const sequelize :Sequelize = new Sequelize(
    process.env.DB_NAME!!,
    process.env.DB_HOST!!,
    process.env.DB_PASS!!,
    {
        dialect: "sqlite",
        storage: dbPath,
        logging: logging
    }
)