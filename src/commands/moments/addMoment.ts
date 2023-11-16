import {
    CommandInteraction, CommandInteractionOption, Message,
    SlashCommandAttachmentOption,
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js"
import {CommandType} from "../../types/Command";
import {Moment} from "../../models/Moment";
import {MomentType} from "../../types/MomentType";
import {onlyLetterRegex} from "../../helper/constants";
import {reject} from "../../helper/functions";

const addMoment: CommandType = {
    data: new SlashCommandBuilder()
        .setName("sm")
        .setDescription("add your moments")
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
        const guildId: string | null = interaction.guildId
        const data: MomentType[] = []

        if (!guildId) return await reject(interaction, "Not accepted!")
        if (!indicator) return await reject(interaction, "Not accepted!")
        if (!text && !attachment) return await reject(interaction, "Not accepted!")
        if (indicator.value && !onlyLetterRegex.test(indicator.value.toString())) return await reject(interaction, "Not accepted!")

        if (text && text.value) {
            if(!onlyLetterRegex.test(text.value.toString())) return await reject(interaction, "Not accepted!")
            data.push({
                indicator: indicator.value as string,
                guildId: guildId as string,
                context: text.value.toString()
            })
        }


        if (attachment && attachment.attachment) {
            data.push({
                indicator: indicator.value as string,
                guildId: guildId as string,
                context: attachment.attachment.url as string
            })
        }

        try {
            await Moment.bulkCreate(data, {returning: true})
            return await interaction.reply({
                content: "Saved!",
                fetchReply: true
            }).then((result: Message): void => {
                result.react("✅")
            })
        } catch (e) {
            return await reject(interaction, "An error occurred")
        }
    },
}

export default addMoment