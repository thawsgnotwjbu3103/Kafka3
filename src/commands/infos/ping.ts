import {CommandInteraction, SlashCommandBuilder} from "discord.js"
import {CommandType} from "../../types/Command";

const ping: CommandType = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("replies with pong!"),
    async execute(interaction: CommandInteraction) {
        const delay = Math.abs(Date.now() - interaction.createdTimestamp)
        await interaction.reply(`Delay: ${delay}ms - Pong!`);
    },
}

export default ping