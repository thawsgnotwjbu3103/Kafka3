import {CommandInteraction, SlashCommandBuilder, SlashCommandStringOption} from "discord.js"
import {CommandType} from "../../types/Command";
import {Moment} from "../../models/Moment";
import {isValidUrl, reject} from "../../helper/functions";
import {onlyLetterRegex} from "../../helper/constants";
import {sequelize} from "../../helper/database";

const getMoment: CommandType = {
    data: new SlashCommandBuilder()
        .setName("gm")
        .addStringOption((options: SlashCommandStringOption) =>
            options
                .setName("indicator")
                .setRequired(true)
                .setDescription("input indicator here"))
        .setDescription("get moment by indicator"),
    async execute(interaction: CommandInteraction) {
        const indicator = interaction.options.get("indicator")
        const guildId = interaction.guildId

        if (!indicator) return await reject(interaction, "Not accepted!")
        if (!guildId) return await reject(interaction, "Not accepted!")
        if (indicator.value && !onlyLetterRegex.test(indicator.value.toString())) return await reject(interaction, "Not accepted!")

        const results = await Moment.findAll({
            where: {
                indicator: indicator.value,
                guildId: guildId
            },
            order: sequelize.random(),
            offset: 0,
            limit: 1
        })

        const [result, ] = results
        if (!result) return await reject(interaction, "Can't find it bro, sorry")

        const data = result.dataValues
        if (isValidUrl(data.context)) {
            const replied = await interaction.reply({
                files: [data.context],
                fetchReply: true
            })
            await replied.react("🤣")
            return
        }

        const replied = await interaction.reply({
            content: data.context,
            fetchReply: true,
        })
        await replied.react("🤣")
        return
    }
}

export default getMoment