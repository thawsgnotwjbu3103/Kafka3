import {EmbedBuilder, SlashCommandBuilder, SlashCommandStringOption} from "discord.js"
import {CommandType} from "../../types/Command";
import {DiscussServiceClient} from "@google-ai/generativelanguage"
import {GoogleAuth} from "google-auth-library"
import {reject} from "../../helper/functions";
import {PRIMARY_COLOR} from "../../helper/constants";

const MODEL_NAME = "models/chat-bison-001";
const API_KEY = process.env.PALM_SECRET!!;

const palmapi: CommandType = {
    data: new SlashCommandBuilder()
        .setName("ask")
        .setDescription("ask me anything!")
        .addStringOption((options: SlashCommandStringOption) =>
            options
                .setName("question")
                .setDescription("enter your question here")
                .setRequired(true)
        ),
    async execute(interaction) {
        const client = new DiscussServiceClient({
            authClient: new GoogleAuth().fromAPIKey(API_KEY)
        })

        const question = interaction.options.get("question")
        if (!question) return await reject(interaction, "Bro what ?")
        if (!question.value) return await reject(interaction, "The hell you want me to do ?")
        await interaction.deferReply();
        try {
            const result = await client.generateMessage({
                model: MODEL_NAME, // Required. The model to use to generate the result.
                temperature: 0.5, // Optional. Value `0.0` always uses the highest-probability result.
                candidateCount: 1, // Optional. The number of candidate results to generate.
                prompt: {
                    // Required. Alternating prompt/response messages.
                    messages: [{content: question.value.toString()}],
                },
            });
            const FIRST_ELEMENT = 0
            if (!result) return await reject(interaction, "Nah", true)
            // console.log(result)
            if (!result[FIRST_ELEMENT].candidates) return await reject(interaction, "No.", true)
            if (!result[FIRST_ELEMENT].candidates[FIRST_ELEMENT].content) return await reject(interaction, "I don't wanna answer", true)
            const content = result[FIRST_ELEMENT].candidates[FIRST_ELEMENT].content
            const embed = new EmbedBuilder().setColor(PRIMARY_COLOR).setDescription(content)
            await interaction.editReply({embeds: [embed]})
            return
        } catch (e) {
            return await reject(interaction, "An error occurred", true)
        }
    },
}

export default palmapi