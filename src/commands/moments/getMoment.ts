import {
    CommandInteraction,
    CommandInteractionOption,
    Message,
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js"
import {CommandType} from "../../types/Command";
import {Moment} from "../../models/Moment";
import {reject} from "../../helper/functions";
import {onlyLetterRegex} from "../../helper/constants";
import {sequelize} from "../../helper/database";
import {Model} from "sequelize";
import {MomentType} from "../../types/MomentType";
import {isValidUrl} from "../../helper/functions";

const getMoment: CommandType = {
    data: new SlashCommandBuilder()
        .setName("gm")
        .addStringOption((options: SlashCommandStringOption) =>
            options
                .setName("indicator")
                .setRequired(true)
                .setDescription("input indicator here"))
        .setDescription("get moment by indicator"),
    async execute(interaction: CommandInteraction): Promise<void> {
        const indicator: CommandInteractionOption | null = interaction.options.get("indicator")
        const guildId: string | null = interaction.guildId

        if (!indicator) return await reject(interaction, "Not accepted!")
        if (!guildId) return await reject(interaction, "Not accepted!")
        if (indicator.value && !onlyLetterRegex.test(indicator.value.toString())) return await reject(interaction, "Not accepted!")

        const results: Model<MomentType, MomentType>[] = await Moment.findAll({
            where: {
                indicator: indicator.value,
                guildId: guildId
            },
            order: sequelize.random(),
            offset: 0,
            limit: 1
        })

        const [result, metadata] = results
        if (!result) return await reject(interaction, "Can't find it bro, sorry")

        const data: MomentType = result.dataValues
        if (isValidUrl(data.context)) {
            return await interaction.reply({
                files: [data.context],
                fetchReply: true
            }).then((result: Message): void => {
                result.react("🤣")
            })
        }

        return await interaction.reply({
            content: data.context,
            fetchReply: true,
        }).then((result: Message): void => {
            result.react("🤣")
        })
    }
}

export default getMoment