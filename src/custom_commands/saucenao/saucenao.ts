import {CustomCommandType} from "../../types/Command";
import {ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, Message} from "discord.js";
import sagiri from "sagiri";
import {PRIMARY_COLOR} from "../../helper/constants";

const updateInteraction = async (
    reply: Message,
    i: ButtonInteraction,
    currentEmbeds: EmbedBuilder,
    buttonRow: ActionRowBuilder<ButtonBuilder>
): Promise<void> => {

    await reply.edit({
        embeds: [currentEmbeds],
        components: [buttonRow]
    })
    await i.update({
        embeds: [currentEmbeds],
        components: [buttonRow]
    })
}

const saucenao: CustomCommandType = {
    name: "saucenao",
    async execute(message: Message) {
        const client = sagiri(process.env.SAUCENAO_APIKEY!!)
        let imageUrl = ""
        const params = message.content.split(" ")[1]
        const reference = message.reference
        if (!reference) imageUrl = params
        if (!params) {
            if (reference && reference.messageId) {
                const msg = await message.channel.messages.fetch(reference.messageId)
                const firstAttachment = msg.attachments.first()
                if (firstAttachment && firstAttachment.url) {
                    imageUrl = firstAttachment.url
                }
            }
        }

        if (!imageUrl) {
            await message.reply({content: "THE FCK????"})
            await message.react("❌")
            return
        }

        let currentIndex = 1;
        let maxItem = 1

        const results = await client(imageUrl, {})
        const embeds = results.map((item, ) => {
            const text = `
                # ${item.site} Illustration Details
                
                - **URL:** [${item.site} Illustration](${item.url})
                - **Site:** ${item.site}
                - **Index:** ${item.index}
                - **Similarity:** ${item.similarity}
                - **Author Name:** ${item.authorName || item.site}
                - **Author URL:** [${item.authorName ? `${item.authorName}'s ${item.site} profile` : `This ${item.site} post`}](${item.authorUrl || item.url})
            `

            return new EmbedBuilder()
                .setDescription(text)
                .setImage(item.thumbnail)
                .setColor(PRIMARY_COLOR)
        })

        const totalSlices = Math.ceil(embeds.length / maxItem)

        let currentEmbeds = embeds.slice(currentIndex - 1, maxItem)[0]

        const prev = new ButtonBuilder()
            .setCustomId("PREV")
            .setLabel("◀️")
            .setDisabled(currentIndex <= 1 || embeds.length <= 0)
            .setStyle(ButtonStyle.Primary)

        const next = new ButtonBuilder()
            .setCustomId("NEXT")
            .setLabel("▶️")
            .setDisabled(!currentEmbeds)
            .setStyle(ButtonStyle.Primary)

        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([prev, next])

        const reply = await message.reply({embeds: [currentEmbeds], components: [buttonRow]})
        const collector = reply.createMessageComponentCollector({
            time: 100_000
        })

        collector.on("collect", async (i: ButtonInteraction) => {
            if (i.user.id !== message.author.id) return

            if (i.customId === "PREV") {
                currentIndex--
                buttonRow.components[1].setDisabled(false)
                currentEmbeds = embeds.slice((currentIndex - 1) * maxItem, currentIndex * maxItem)[0]
                if (currentIndex <= 1) {
                    currentIndex = 1
                    currentEmbeds = embeds.slice((currentIndex - 1) * maxItem, currentIndex * maxItem)[0]
                    buttonRow.components[0].setDisabled(true)
                }
                await updateInteraction(reply, i, currentEmbeds, buttonRow)
            }

            if (i.customId === "NEXT") {
                currentIndex++
                buttonRow.components[0].setDisabled(false)
                if (currentIndex > totalSlices) {
                    currentIndex--
                    buttonRow.components[1].setDisabled(true)
                }
                currentEmbeds = embeds.slice((currentIndex - 1) * maxItem, currentIndex * maxItem)[0]
                await updateInteraction(reply, i, currentEmbeds, buttonRow)
            }
        })
    }
}

export default saucenao