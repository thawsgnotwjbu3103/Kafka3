import {CustomCommandType} from "../../types/Command";
import {Attachment, EmbedBuilder, Message, MessageReference} from "discord.js";
import sagiri, {SagiriResult} from "sagiri";

const saucenao: CustomCommandType = {
    name: "saucenao",
    async execute(message: Message): Promise<void>{
        const client = sagiri(process.env.SAUCENAO_APIKEY!!)
        let imageUrl: string = ""
        const params: string = message.content.split(" ")[1]
        const reference: MessageReference | null = message.reference
        if(!reference) imageUrl = params
        if(!params) {
            if(reference && reference.messageId) {
                const msg: Message= await message.channel.messages.fetch(reference.messageId)
                const firstAttachment: Attachment | undefined = msg.attachments.first()
                if(firstAttachment && firstAttachment.url) {
                    imageUrl = firstAttachment.url
                }
            }
        }

        if(!imageUrl) {
            return await message.reply({
                content: "THE FCK????"
            }).then((result: Message) => {
                result.react("❌")
            })
        }

        const results: SagiriResult[] = await client(imageUrl, {})
        const embeds: EmbedBuilder[] = results.map((item: SagiriResult, index) => {
            return new EmbedBuilder()
                .setTitle(`** Source: ${item.url} - Similarity: ${item.similarity} **`)
                .setDescription(`** Artist: ${item.authorName || "Unnamed Author"} || Profile: ${item.authorUrl || "No profile url"} **`)
                .setURL(item.url)
                .setImage(item.thumbnail)
        })

        return await message.reply({
            embeds: embeds,
        }).then()
    }
}

export default saucenao