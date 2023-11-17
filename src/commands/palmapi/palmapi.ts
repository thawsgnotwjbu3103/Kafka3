import {
    CommandInteraction,
    CommandInteractionOption,
    Message,
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js"
import {CommandType} from "../../types/Command";
import {DiscussServiceClient} from "@google-ai/generativelanguage"
import {GoogleAuth} from "google-auth-library"
import {reject} from "../../helper/functions";

const MODEL_NAME: string = "models/chat-bison-001";
const API_KEY: string = process.env.PALM_SECRET!!;

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
    async execute(interaction: CommandInteraction): Promise<void> {
        const client: DiscussServiceClient = new DiscussServiceClient({
            authClient: new GoogleAuth().fromAPIKey(API_KEY)
        })

        const question: CommandInteractionOption | null = interaction.options.get("question")
        if(!question) return await reject(interaction, "Bro what ?")
        if(!question.value) return await reject(interaction, "The hell you want me to do ?")
        await interaction.deferReply();
        try {
            const result = await client.generateMessage({
                model: MODEL_NAME, // Required. The model to use to generate the result.
                temperature: 0.5, // Optional. Value `0.0` always uses the highest-probability result.
                candidateCount: 1, // Optional. The number of candidate results to generate.
                prompt: {
                    // Required. Alternating prompt/response messages.
                    messages: [{ content: question.value.toString() }],
                },
            });
            const FIRST_ELEMENT = 0
            if(!result) return await reject(interaction, "Nah")
            if(!result[FIRST_ELEMENT].candidates) return await reject(interaction, "No.")
            if(!result[FIRST_ELEMENT].candidates[FIRST_ELEMENT].content) return await reject(interaction, "I don't wanna answer")
            const content: string = result[FIRST_ELEMENT].candidates[FIRST_ELEMENT].content
            return await interaction.editReply(content).then((result: Message): void => {
                result.react("🗣️")
            })
        } catch (e) {
            return await reject(interaction, "An error occurred")
        }
    },
}

export default palmapi