import {CommandInteraction, SlashCommandBuilder} from "discord.js";

export interface CommandType {
    data: any;
    execute(interaction: CommandInteraction): Promise<void>;
}
