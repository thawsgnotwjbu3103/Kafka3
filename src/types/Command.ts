import { CommandInteraction, Message} from "discord.js";

export interface CommandType {
    data: any;
    execute(interaction: CommandInteraction): Promise<void>;
}

export interface CustomCommandType {
    name: string,
    execute(message: Message) : Promise<void> | void
}
