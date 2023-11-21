import {CustomCommandType} from "../../types/Command";
import {
    ActionRowBuilder,
    Attachment,
    ButtonBuilder, ButtonInteraction,
    ButtonStyle,
    EmbedBuilder, InteractionCollector,
    Message,
    MessageReference
} from "discord.js";
import sagiri, {SagiriResult} from "sagiri";
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
    async execute(message: Message): Promise<void> {
        const client = sagiri(process.env.SAUCENAO_APIKEY!!)
        let imageUrl: string = ""
        const params: string = message.content.split(" ")[1]
        const reference: MessageReference | null = message.reference
        if (!reference) imageUrl = params
        if (!params) {
            if (reference && reference.messageId) {
                const msg: Message = await message.channel.messages.fetch(reference.messageId)
                const firstAttachment: Attachment | undefined = msg.attachments.first()
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

        const results: SagiriResult[] = await client(imageUrl, {})
        const embeds: EmbedBuilder[] = results.map((item: SagiriResult, index) => {
            const text: string = `
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

        let currentEmbeds: EmbedBuilder = embeds.slice(currentIndex - 1, maxItem)[0]

        const prev: ButtonBuilder = new ButtonBuilder()
            .setCustomId("PREV")
            .setLabel("◀️")
            .setDisabled(currentIndex <= 1 || embeds.length <= 0)
            .setStyle(ButtonStyle.Primary)

        const next: ButtonBuilder = new ButtonBuilder()
            .setCustomId("NEXT")
            .setLabel("▶️")
            .setDisabled(!currentEmbeds)
            .setStyle(ButtonStyle.Primary)

        const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([prev, next])

        const reply: Message = await message.reply({embeds: [currentEmbeds], components: [buttonRow]})
        const collector: InteractionCollector<any> = reply.createMessageComponentCollector({
            time: 100_000
        })

        collector.on("collect", async (i: ButtonInteraction): Promise<void> => {
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