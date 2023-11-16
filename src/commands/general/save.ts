import {
    CommandInteraction, CommandInteractionOption,
    SlashCommandAttachmentOption,
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js"
import {CommandType} from "../../types/Command";
import {Save} from "../../models/Save";

const save: CommandType = {
    data: new SlashCommandBuilder()
        .setName("sm")
        .setDescription("save your bruh moments")
        .addStringOption((options: SlashCommandStringOption) =>
            options
                .setName("indicator")
                .setRequired(true)
                .setDescription("a name for this moment"))
        .addAttachmentOption((options: SlashCommandAttachmentOption) =>
            options
                .setRequired(false)
                .setName("quote_attachment")
                .setDescription("add a attachment quote"))
        .addStringOption((options: SlashCommandStringOption) =>
            options
                .setName("quote_text")
                .setRequired(false)
                .setDescription("add a text quote")),
    async execute(interaction: CommandInteraction): Promise<void> {
        const attachment: CommandInteractionOption | null = interaction.options.get("quote_attachment")
        const text: CommandInteractionOption | null = interaction.options.get("quote_text")
        const indicator: CommandInteractionOption | null = interaction.options.get("indicator")

        if(text) {

        }

        if(attachment) {

        }

    },
}

export default save