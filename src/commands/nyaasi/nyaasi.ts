import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction,
    CommandInteractionOption,
    EmbedBuilder,
    InteractionCollector,
    Message,
    SlashCommandBuilder,
    SlashCommandStringOption,
} from "discord.js"
import {CommandType} from "../../types/Command";
import {reject} from "../../helper/functions";
import axios, {AxiosResponse} from "axios";
import * as cheerio from "cheerio"
import {NyaasiType} from "../../types/NyassiType";
import {DEFAULT_INDEX, NYAASI_CATEGORY_ARR, NYAASI_FILTER_ARR, PRIMARY_COLOR} from "../../helper/constants";

const fetchData = async (filter: string, categories: string, query: string, page: number = 1): Promise<NyaasiType[]> => {
    const api: string = `https://nyaa.si/?f=${filter}&c=${categories}&q=${query}&p=${page}&o=desc&s=downloads`
    const htmlPage: AxiosResponse<any, any> = await axios.get(api)
    const $: cheerio.CheerioAPI = cheerio.load(htmlPage.data)
    const nyaasi: NyaasiType[] = []

    const tdElement: cheerio.Cheerio<cheerio.Element> = $("tr")
    tdElement.each((index: number, element: cheerio.Element): void => {
        const html: cheerio.Cheerio<cheerio.Element> = $(element);

        const category: string = html.find('td a img.category-icon').attr('alt')!!;
        const title: string = html.find('td[colspan="2"] a:not(.comments)').attr('title')!!;
        const torrentLink: string = html.find('td.text-center a[href$=".torrent"]').attr('href')!!;
        const magnetLink: string = html.find('td.text-center a[href^="magnet:"]').attr('href')!!;
        const size: string = html.find('td.text-center').eq(1).text();
        const timestamp: string = html.find('td.text-center[data-timestamp]').attr('data-timestamp')!!;
        const seeders: string = html.find('td.text-center').eq(2).text();
        const leechers: string = html.find('td.text-center').eq(3).text();
        const completed: string = html.find('td.text-center').eq(4).text();
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
    return nyaasi
}

const genMarkdownString = (arr: NyaasiType[]): string => {
    return arr.map((item: NyaasiType): string | undefined => {
        if (item.name) {
            return `* [${item.name}](https://nyaa.si/${item.link.torrent}) - **${item.size}**`
        }
    }).join("\r\n")
}

const updateInteraction = async (
    interaction: CommandInteraction,
    i: ButtonInteraction,
    tempArr: NyaasiType[],
    buttonRow: ActionRowBuilder<ButtonBuilder>
): Promise<void> => {
    const text: string = genMarkdownString(tempArr)
    const updatedEmbed: EmbedBuilder = new EmbedBuilder().setDescription(text).setColor(PRIMARY_COLOR)
    await interaction.editReply({embeds: [updatedEmbed], components: [buttonRow]})
    i.update({embeds: [updatedEmbed], components: [buttonRow]}).then()
}

const ping: CommandType = {
    data: new SlashCommandBuilder()
        .setName("nyaasi")
        .setDescription("Find your things at nyaa.si")
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
        const reply: Message = await interaction.deferReply({fetchReply: true});
        let page: number = 1
        let nyaasi: NyaasiType[] = await fetchData(filter.value, categories.value, option.value.toString(), page)


        let maxItem: number = 10
        let currentIndex: number = 1
        let tempArr: NyaasiType[] = []
        const totalSlices = Math.ceil(nyaasi.length / maxItem)
        tempArr = nyaasi.slice(currentIndex - 1, maxItem)
        const text: string = genMarkdownString(tempArr)

        const embed: EmbedBuilder = new EmbedBuilder()
            .setDescription(tempArr.length ? text : "NO CONTENT")
            .setColor(PRIMARY_COLOR)

        const prev: ButtonBuilder = new ButtonBuilder()
            .setCustomId("PREV")
            .setLabel("◀️")
            .setDisabled(tempArr.length <= 0 || currentIndex <= 1)
            .setStyle(ButtonStyle.Primary)

        const next: ButtonBuilder = new ButtonBuilder()
            .setCustomId("NEXT")
            .setLabel("▶️")
            .setDisabled(tempArr.length <= 0)
            .setStyle(ButtonStyle.Primary)

        const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
            .setComponents([prev, next])

        await interaction.editReply({embeds: [embed], components: [buttonRow]})

        const collector: InteractionCollector<any> = reply.createMessageComponentCollector({
            time: 100_000
        })
        collector.on("collect", async (i: ButtonInteraction): Promise<void> => {
            await reply.reactions.removeAll()
            if (i.user.id !== interaction.user.id) return
            if (i.customId === "NEXT") {
                currentIndex += 1
                buttonRow.components[0].setDisabled(false) // 0 is PREV, 1 is NEXT
                if (currentIndex > totalSlices) {
                    currentIndex -= 1
                    buttonRow.components[1].setDisabled(true) // 0 is PREV, 1 is NEXT
                }
                tempArr = nyaasi.slice((currentIndex - 1) * maxItem, maxItem * currentIndex) // GET NEXT ITEMS
                await updateInteraction(interaction, i, tempArr, buttonRow)
            }
            if (i.customId === "PREV") {
                currentIndex -= 1
                buttonRow.components[1].setDisabled(false) // 0 is PREV, 1 is NEXT
                if (currentIndex <= 1) {
                    currentIndex = 1
                    buttonRow.components[0].setDisabled(true)
                }
                tempArr = nyaasi.slice((currentIndex - 1) * maxItem, maxItem * currentIndex)
                await updateInteraction(interaction, i, tempArr, buttonRow)
            }
        });
    },
}

export default ping