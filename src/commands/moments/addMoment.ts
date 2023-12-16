import {CommandInteraction, SlashCommandBuilder} from "discord.js"
import {CommandType} from "../../types/Command";
import {Moment} from "../../models/Moment";
import {MomentType} from "../../types/MomentType";
import {onlyLetterRegex} from "../../helper/constants";
import {reject} from "../../helper/functions";

const addMoment: CommandType = {
    data: new SlashCommandBuilder()
        .setName("sm")
        .setDescription("add your moments")
        .addStringOption(options =>
            options
                .setName("indicator")
                .setRequired(true)
                .setDescription("a name for this moment"))
        .addAttachmentOption(options =>
            options
                .setRequired(false)
                .setName("quote_attachment")
                .setDescription("add a attachment quote"))
        .addStringOption(options =>
            options
                .setName("quote_text")
                .setRequired(false)
                .setDescription("add a text quote")),
    async execute(interaction: CommandInteraction) {
        const attachment = interaction.options.get("quote_attachment")
        const text = interaction.options.get("quote_text")
        const indicator = interaction.options.get("indicator")
        const guildId = interaction.guildId
        const data: MomentType[] = []

        if (!guildId) return await reject(interaction, "Not accepted!")
        if (!indicator) return await reject(interaction, "Not accepted!")
        if (!text && !attachment) return await reject(interaction, "Not accepted!")
        if (indicator.value && !onlyLetterRegex.test(indicator.value.toString())) return await reject(interaction, "Not accepted!")

        if (text && text.value) {
            if (!onlyLetterRegex.test(text.value.toString())) return await reject(interaction, "Not accepted!")
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
            const replied = await interaction.reply({
                content: "Saved!",
                fetchReply: true
            })
            await replied.react("✅")
            return
        } catch (e) {
            return await reject(interaction, "An error occurred")
        }
    },
}

export default addMoment