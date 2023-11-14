import {ApplicationCommandDataResolvable, Client, ClientEvents, Collection, GatewayIntentBits, Guild} from "discord.js";
import {CommandType} from "../types/Command";
import glob from "glob";
import {promisify} from "util";
import {RegisterCommandsOptions} from "../types/Client";
import {Event} from "./Event";

const globPromise = promisify(glob)
import {dirname} from 'path';
import {fileURLToPath} from 'url';
import * as path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();

    constructor() {
        super({intents: 32767});
    }

    start() {
        this.registerModules()
        this.login(process.env.CLIENT_TOKEN)
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({commands, guildId}: RegisterCommandsOptions) {
        if (guildId) {
            this.guilds.cache.get(guildId)?.commands.set(commands);
            console.log(`Registering commands to ${guildId}`);
        } else {
            this.application?.commands.set(commands);
            console.log("Registering global commands");
        }
    }

    async registerModules() {
        // Commands
        let guildId: string | undefined
        const slashCommands: ApplicationCommandDataResolvable[] = []
        const commandFolderPath = path.resolve(__dirname, "../commands")
        const commandFiles = await globPromise(`${commandFolderPath}/*/*{.ts,.js}`, {windowsPathsNoEscape: true});
        console.log({commandFiles})
        commandFiles.forEach(async (filePath) => {
            const command: CommandType = await this.importFile("file://" + filePath);
            if (!command.name) return;
            console.log(command);

            this.commands.set(command.name, command);
            slashCommands.push(command);
        });

        this.on("guildCreate", (gData: Guild) => {
            guildId = gData.id
        })

        this.on("ready", () => {
            this.registerCommands({
                commands: slashCommands,
                guildId: guildId
            });
        })

        // Events
        const eventFolderPath = path.resolve(__dirname, "../events")
        const eventFiles = await globPromise(`${eventFolderPath}/*{.ts,.js}`, {windowsPathsNoEscape: true});
        console.log(eventFiles)
        eventFiles.forEach(async (filePath: string) => {
            const event: Event<keyof ClientEvents> = await this.importFile("file://" + filePath);
            this.on(event.event, event.run);
        });
    }
}