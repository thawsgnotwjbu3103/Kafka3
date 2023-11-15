import {
    Client, Collection, GatewayIntentBits, Interaction, REST,
    RESTPostAPIChatInputApplicationCommandsJSONBody, Routes
} from "discord.js";
import dotenv from "dotenv"
import * as path from "path"
import * as url from "url"
import glob from "glob"
import {promisify} from "util"
import {CommandType} from "./types/Command";
import {sequelize} from "./helper/database";

dotenv.config()

const __filename: string = url.fileURLToPath(import.meta.url)
const __dirname: string = path.dirname(__filename)
const globPromise = promisify(glob)

class KafkaClient extends Client {
    commands: Collection<any, any> = new Collection<any, any>()
}

const client: KafkaClient = new KafkaClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
    ]
})

client.once("ready", (c: Client): void => {
    if (!c.user) return
    console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.commands = new Collection()
const build = async (): Promise<void> => {
    const importFile = async (filePath: string): Promise<CommandType> => {
        return (await import(filePath))?.default;
    }
    const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    const commandPath: string = path.resolve(__dirname, "./commands");
    const commandFiles: string[] = await globPromise(`${commandPath}/*/*{.ts,.js}`, {windowsPathsNoEscape: true})
    await Promise.all(commandFiles.map(async (filePath: string): Promise<void> => {
        const command: CommandType = await importFile(`file://${filePath}`)
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON())
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }))

    client.on("interactionCreate", async (interaction: Interaction): Promise<void> => {
        if (!interaction.isChatInputCommand()) return;
        const interactionClient: KafkaClient = interaction.client as KafkaClient
        const command = interactionClient.commands.get(interaction.commandName)
        if (!command) {
            return console.error(`No command matching ${interaction.commandName} was found.`);
        }

        try {
            await command.execute(interaction);
        } catch (e) {
            console.error(e);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            } else {
                await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
            }
        }
    })

    const rest: REST = new REST().setToken(process.env.CLIENT_TOKEN!!);

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!!),
            {body: commands},
        );
        console.log(`Successfully reloaded commands.`);
        await sequelize.authenticate()
        console.log("DB connected")
        await sequelize.sync({force: process.env.NODE_ENV !== "production"})
        console.log("DB Synced")
    } catch (error) {
        console.error(error);
    }
}

build()
client.login(process.env.CLIENT_TOKEN!!)

process.on("unhandledRejection", (e: Error): void => {
    console.error(e.stack)
})

process.on("uncaughtException", (e: Error): void => {
    console.error(e.stack)
})
