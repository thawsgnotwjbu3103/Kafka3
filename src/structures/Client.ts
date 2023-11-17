import {
    Client,
    Collection,
    GatewayIntentBits,
    Interaction, Message, REST,
    RESTPostAPIChatInputApplicationCommandsJSONBody, Routes
} from "discord.js";
import url from "url";
import path from "path";
import {promisify} from "util";
import glob from "glob";
import {CommandType, CustomCommandType} from "../types/Command";
import {checkValidCommand} from "../helper/functions";

const __filename: string = url.fileURLToPath(import.meta.url)
const __dirname: string = path.dirname(__filename)
const globPromise = promisify(glob)

class KafkaClient extends Client {
    commands: Collection<string, CommandType> = new Collection<string, CommandType>();
    customCommands: Collection<string, CustomCommandType> = new Collection<string, CustomCommandType>()

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.MessageContent,
            ]
        });
    }

    async importFile(filePath: string): Promise<any> {
        return (await import(filePath))?.default;
    }

    async start(): Promise<void> {
        await this.registerModules();
        await this.login(process.env.CLIENT_TOKEN!!)
    }


    async registerModules(): Promise<void> {

        const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
        this.commands = new Collection();
        const commandFolderPath: string = path.resolve(__dirname, "../commands");
        const commandFiles: string[] = await globPromise(`${commandFolderPath}/*/*{.ts,.js}`, {windowsPathsNoEscape: true})
        await Promise.all(commandFiles.map(async (filePath: string): Promise<void> => {
            const command: CommandType = await this.importFile(`file://${filePath}`)
            if ('data' in command && 'execute' in command) {
                this.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }))

        this.customCommands = new Collection();
        const customCommandFolderPath: string = path.resolve(__dirname, "../custom_commands")
        const customCommandFiles: string[] = await globPromise(`${customCommandFolderPath}/*/*{.ts,.js}`, {windowsPathsNoEscape: true})
        await Promise.all(customCommandFiles.map(async (filePath: string): Promise<void> => {
            const customCommand: CustomCommandType = await this.importFile(`file://${filePath}`)
            if('name' in customCommand && 'execute' in customCommand) {
                this.customCommands.set(customCommand.name, customCommand)
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`);
            }
        }))


        this.once("ready", (c: Client) => {
            if (!c.user) return;
            console.log(`Ready! Logged in as ${c.user.tag}`);
        })

        this.on("interactionCreate", async (interaction: Interaction): Promise<void> => {
            if (!interaction.isChatInputCommand()) return
            const interactionClient: KafkaClient = interaction.client as KafkaClient;
            const command: CommandType | undefined = interactionClient.commands.get(interaction.commandName);
            if (!command) return console.error(`No command matching ${interaction.commandName} was found.`);
            try {
                await command.execute(interaction)
            } catch (e) {
                console.error(e)
                if (interaction.replied || interaction.deferred) {
                    return await interaction.followUp({
                        content: 'There was an error while executing this command!',
                        ephemeral: true
                    }).then();
                }
                return await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                }).then();
            }
        })

        this.on("messageCreate", async (message: Message): Promise<void> => {
            const content: string = message.content
            const CUSTOM_PREFIX: string = process.env.CUSTOM_PREFIX!!
            if(!content.startsWith(CUSTOM_PREFIX) || !checkValidCommand(content, CUSTOM_PREFIX)) return;
            const PREFIX_INDEX = 1
            const COMMAND_INDEX = 0
            const text: string = content.slice(PREFIX_INDEX)
            const commandName: string | null= text.split(" ")[COMMAND_INDEX] || null
            if(!commandName) return
            const interactionClient: KafkaClient = message.client as KafkaClient
            const command: CustomCommandType |undefined =  interactionClient.customCommands.get(commandName)
            if (!command) return console.error(`No command matching ${commandName} was found.`);
            try {
                await command.execute(message)
            } catch (e) {
                console.error(e)
                return await message.reply({
                    content: 'There was an error while executing this command!',
                }).then();
            }
        })

        const rest: REST = new REST().setToken(process.env.CLIENT_TOKEN!!)

        try {
            console.log(`Started refreshing ${this.commands.size} application (/) commands.`);
            console.log(`Started refreshing ${this.customCommands.size} custom application (/) commands.`);
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID!!),
                {body: commands},
            );
        } catch (e) {
            console.error(e);
        }

    }
}

export default KafkaClient