import {CustomCommandType} from "../../types/Command";
import {EmbedBuilder} from "discord.js";
import axios from "axios";
import * as cheerio from "cheerio"
import {Champion, TftTrait, TftType} from "../../types/TftType";
import {PRIMARY_COLOR} from "../../helper/constants";

const tft: CustomCommandType = {
    name: "tft",
    async execute(message) {
        const data = await fetchData()
        const text = data.map(item => {
            return `* [${item.metaName}](${item.builder}) - Cost: ${item.cost}`
        }).join("\r\n")
        const embed = new EmbedBuilder()
            .setDescription(text)
            .setColor(PRIMARY_COLOR)
        await message.reply({embeds: [embed]})
    }
}

const fetchData = async () => {
    const url = "https://lolchess.gg/meta"
    const htmlPage = await axios.get(url)
    const $ = cheerio.load(htmlPage.data)
    const boxElement = $(".guide-meta__deck")
    const data: TftType[] = []
    boxElement.each((index, element) => {
        const html = $(element);
        let traits: TftTrait[] = []
        let champions: Champion[] = []
        const metaName =
            html
                .find(".guide-meta__deck__column.name.mr-3")
                .clone()
                .children()
                .remove()
                .end()
                .text()
                .trim()
        const traitElement = html.find(".tft-hexagon-image")
        traitElement.each((index, element) => {
            const htmlTrait = $(element)
            const trait: TftTrait = {
                stack: "bronze",
                url: "",
                isHeadliner: false
            }
            let traitType = htmlTrait.attr("class")!!
            trait.url = htmlTrait.find("img").attr("src")!!
            traitType = traitType.split(" ")[1]
            trait.isHeadliner = htmlTrait.find('.headliner').length > 0
            switch (traitType) {
                case "tft-hexagon-image--chromatic":
                    trait.stack = "chromatic"
                    break;
                case "tft-hexagon-image--gold":
                    trait.stack = "gold"
                    break;
                case "tft-hexagon-image--silver":
                    trait.stack = "silver"
                    break;
                case "tft-hexagon-image--bronze":
                    trait.stack = "bronze"
                    break;
            }
            traits.push(trait)
        })
        const championElement = html.find(".tft-champion-box")
        championElement.each((index, element) => {
            const championHtml = $(element)
            const items: string[] = []
            const url = championHtml.find(".tft-champion img").attr("src")!!
            const name = championHtml.find(".tft-champion .name").text()!!
            const cost = championHtml.find(".tft-champion .cost").text()!!
            const isHeadliner = championHtml.find(".tft-champion .headliner-ico").length > 0
            const itemsHtml = championHtml.find(".tft-items img")
            itemsHtml.each((index, element) => {
                const url = $(element).attr("src")!!
                items.push(url)
            })
            champions.push({name, url, items, cost, isHeadliner})
        })
        const cost = html.find(".guide-meta__deck__column.cost span.d-block").text()
        const builder = html.find(".guide-meta__deck__column.open-builder.mr-3 a").attr("href")!!
        data.push({
            metaName,
            cost,
            champions,
            traits,
            builder
        })
    })
    return data
}

export default tft