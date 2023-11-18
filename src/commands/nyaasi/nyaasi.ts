import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    CommandInteractionOption, EmbedBuilder, Encoding,
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js"
import {CommandType} from "../../types/Command";
import {nyaasiHtml, reject} from "../../helper/functions";
import axios, {AxiosResponse} from "axios";
import * as cheerio from "cheerio"
import {NyaasiType} from "../../types/NyassiType";
import {DEFAULT_INDEX, NYAASI_CATEGORY_ARR, NYAASI_FILTER_ARR} from "../../helper/constants";
import nodeHtmlToImage from "node-html-to-image";

const ping: CommandType = {
    data: new SlashCommandBuilder()
        .setName("nyaasi")
        .setDescription("replies with pong!")
        .addStringOption((options: SlashCommandStringOption) =>
            options
                .setName("search")
                .setRequired(true)
                .setDescription("Input what you want to search"))
        .addStringOption((options: SlashCommandStringOption) =>
                options
                    .setName("filter")
                    .setDescription("Select filter")
                    .addChoices(...NYAASI_FILTER_ARR))
        .addStringOption((options: SlashCommandStringOption) =>
            options
                .setName("categories")
                .setDescription("Select categories")
                .addChoices(...NYAASI_CATEGORY_ARR))
    ,
    async execute(interaction: CommandInteraction): Promise<void> {
        const option: CommandInteractionOption | null = interaction.options.get("search")
        const filter: any = interaction.options.get("filter") || NYAASI_FILTER_ARR[DEFAULT_INDEX]
        const categories: any = interaction.options.get("categories") || NYAASI_CATEGORY_ARR[DEFAULT_INDEX]
        if (!option) return await reject(interaction, "Where's the question mtfk ?")
        if (!option.value) return await reject(interaction, "WTF???")
        await interaction.deferReply({ephemeral: true});
        const api: string = `https://nyaa.si/?f=${filter.value}&c=${categories.value}&q=${option.value.toString()}`
        console.log(`Calling ${api}`)
        const htmlPage: AxiosResponse<any, any> = await axios.get(api)
        const $: cheerio.CheerioAPI = cheerio.load(htmlPage.data)
        const nyaasi: NyaasiType[] = []
        const pageElementArray: cheerio.Cheerio<cheerio.Element> =
            $("ul.pagination li:not(.next):not(.disabled):not(.previous .disabled .unavailable)")

        const tdElement: cheerio.Cheerio<cheerio.Element> = $("tr")
        tdElement.each((index: number, element: cheerio.Element): void => {
            const html = $(element);

            // Extract data from the columns within each row
            const category = html.find('td a img.category-icon').attr('alt')!!;
            const title = html.find('td[colspan="2"] a').attr('title')!!;
            const torrentLink = html.find('td.text-center a[href$=".torrent"]').attr('href')!!;
            const magnetLink = html.find('td.text-center a[href^="magnet:"]').attr('href')!!;
            const size = html.find('td.text-center').eq(1).text();
            const timestamp = html.find('td.text-center[data-timestamp]').attr('data-timestamp')!!;
            const seeders = html.find('td.text-center').eq(2).text();
            const leechers = html.find('td.text-center').eq(3).text();
            const completed = html.find('td.text-center').eq(4).text();
            nyaasi.push({
                category: category,
                name: title,
                link: {
                    torrent: torrentLink,
                    magnet: magnetLink
                },
                size: size,
                date: timestamp,
                seeders: parseInt(seeders),
                leechers: parseInt(leechers),
                downloads: parseInt(completed)
            })
        });

        const totalPages: number = parseInt($(pageElementArray[pageElementArray.length - 1]).text())
        const images = await nodeHtmlToImage({
            html: nyaasiHtml(nyaasi),
            quality: 100,
            type: 'jpeg',
            puppeteerArgs: {
                args: ['--no-sandbox'],
            },
            encoding: 'binary'
        })

        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm Ban')
            .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(cancel, confirm);

        await interaction.editReply({
            // @ts-ignore
            files: [images],
            // @ts-ignore
            components: [row]
        });
    },
}

export default ping