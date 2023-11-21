import {CommandInteraction, Message} from "discord.js";
import * as url from "url";
import {NyaasiType} from "../types/NyassiType";

export const reject = async (interaction: CommandInteraction, message: string, isSent: boolean = false): Promise<void> => {
    const replied: Message = isSent ? await interaction.editReply({
        content: message,
    }) : await interaction.reply({
        content: message,
        fetchReply: true
    })
    await replied.react("❌")
    return
}

export const isValidUrl = (s: string): boolean => {
    try {
        new url.URL(s);
        return true
    } catch (e) {
        return false
    }
}

export const checkValidCommand = (str: string, prefix: string): boolean => {
    let count = 0;
    for (const strElement of str) {
        if (strElement === prefix) {
            count++
        }
    }
    return count === 1
}

export const trimString = (str: string, max: number): string => {
    if (str) {
        return ((str.length > max) ? `${str.slice(0, max - 3)}...` : str)
    }
    return str
}