import {CustomCommandType} from "../../types/Command";
import {Message} from "discord.js";
import axios from "axios";
import * as cheerio from "cheerio"
import {AxiosResponse} from "axios/index";
import {Champion, TftTrait, TftType} from "../../types/TftType";
import * as util from "util"

const fetchData = async (): Promise<void> => {
    const url: string = "https://lolchess.gg/meta"
    const htmlPage: AxiosResponse<any, any> = await axios.get(url)
    const $: cheerio.CheerioAPI = cheerio.load(htmlPage.data)
    const boxElement: cheerio.Cheerio<cheerio.Element> = $(".guide-meta__deck")
    const data: TftType[] = []
    boxElement.each((index: number, element: cheerio.Element): void => {
        const html: cheerio.Cheerio<cheerio.Element> = $(element);
        let traits: TftTrait[] = []
        let champions: Champion[] = []
        const metaName: string =
            html
                .find(".guide-meta__deck__column.name.mr-3")
                .clone()
                .children()
                .remove()
                .end()
                .text()
                .trim()
        const traitElement: cheerio.Cheerio<cheerio.Element> = html.find(".tft-hexagon-image")
        traitElement.each((index: number, element: cheerio.Element):void => {
            const htmlTrait: cheerio.Cheerio<cheerio.Element> = $(element)
            const trait: TftTrait = {
                stack: "bronze",
                name: "",
                url: "",
                isHeadline: false
            }
            let traitType: string = htmlTrait.attr("class")!!
            trait.url = htmlTrait.find("img").attr("src")!!
            traitType = traitType.split(" ")[1]
            trait.isHeadline = htmlTrait.find(".headliner").length > 0
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
        const championElement: cheerio.Cheerio<cheerio.Element> = html.find(".tft-champion-box")
        championElement.each((index: number, element: cheerio.Element):void => {
            const championHtml: cheerio.Cheerio<cheerio.Element> = $(element)
            const items: string[] = []
            const url: string = championHtml.find(".tft-champion img").attr("src")!!
            const name: string = championHtml.find(".tft-champion .name").text()!!
            const cost: string = championHtml.find(".tft-champion .cost").text()!!
            const itemsHtml: cheerio.Cheerio<cheerio.Element> = championHtml.find(".tft-items img")
            itemsHtml.each((index: number, element: cheerio.Element):void => {
                const url: string = $(element).attr("src")!!
                items.push(url)
            })
            champions.push({name, url, items, cost})
        })
        const cost: string = html.find(".guide-meta__deck__column.cost span.d-block").text()
        const builder: string = html.find(".guide-meta__deck__column.open-builder.mr-3 a").attr("href")!!
        data.push({
            metaName,
            cost,
            champions,
            traits,
            builder
        })
    })
    console.log(util.inspect(data, true, null, false))
}

const tft: CustomCommandType = {
    name: "tft",
    async execute(message: Message): Promise<void> {
        await fetchData()
        await message.reply("OK")
    }
}

export default tft