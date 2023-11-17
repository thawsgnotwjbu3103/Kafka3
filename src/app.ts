import KafkaClient from "./structures/Client";
import {sequelize} from "./helper/database";

const client: KafkaClient = new KafkaClient();

(async (): Promise<void> => {
    try {
        await sequelize.authenticate()
        console.log("DB connected")
        await sequelize.sync()
        console.log("DB Syncing Successfully")
        await client.start()
    } catch (e) {
        console.error(e);
    }
})()
process.on("unhandledRejection", (e: Error): void => console.error(e.stack))
process.on("uncaughtException", (e: Error): void => console.error(e.stack))
