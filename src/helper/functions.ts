import {CommandInteraction, Message} from "discord.js";
import * as url from "url";
import {NyaasiType} from "../types/NyassiType";

export const reject = async (interaction: CommandInteraction, message: string): Promise<void> => {
    await interaction.reply({
        content: message,
        fetchReply: true
    }).then((result: Message): void => {
        result.react("❌")
    })
}

export const isValidUrl = (s: string): boolean => {
    try {
        new url.URL(s);
        return true
    } catch (e) {
        return false
    }
}

export const checkValidCommand = (str: string, prefix: string):boolean => {
    let count = 0;
    for (const strElement of str) {
        if(strElement === prefix) {
            count++
        }
    }
    return count === 1
}

export const trimString = (str: string, max: number): string => {
    if(str) {
        return ((str.length > max) ? `${str.slice(0, max - 3)}...` : str)
    }
    return str
}