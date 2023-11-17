import {CommandInteraction, CommandInteractionOption, SlashCommandBuilder, SlashCommandStringOption} from "discord.js"
import {CommandType} from "../../types/Command";
import {reject} from "../../helper/functions";
import axios, {AxiosResponse} from "axios";
import * as cheerio from "cheerio"

const ping: CommandType = {
    data: new SlashCommandBuilder()
        .setName("nyaasi")
        .setDescription("replies with pong!")
        .addStringOption((options: SlashCommandStringOption) =>
            options
                .setName("search")
                .setRequired(true)
                .setDescription("Input what you want to search")),
    async execute(interaction: CommandInteraction): Promise<void> {
        const option: CommandInteractionOption | null = interaction.options.get("search")
        if (!option) return await reject(interaction, "Where's the question mtfk ?")
        if (!option.value) return await reject(interaction, "WTF???")
        await interaction.deferReply({ephemeral: true});
        const htmlPage: AxiosResponse<any, any> = await axios.get(`https://nyaa.si/?f=0&c=0_0&q=${option.value.toString()}`)
        const $: cheerio.CheerioAPI = cheerio.load(htmlPage.data)
        const pageElementArray: cheerio.Cheerio<cheerio.Element> =
            $("ul.pagination li:not(.next):not(.disabled):not(.previous .disabled .unavailable)")

        const totalPages: number = parseInt($(pageElementArray[pageElementArray.length - 1]).text())



        await interaction.editReply({
            content: "BRUH",
        });
    },
}

export default ping