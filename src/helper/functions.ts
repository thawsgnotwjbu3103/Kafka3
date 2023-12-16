import {CommandInteraction} from "discord.js";
import * as url from "url";

export const reject = async (interaction: CommandInteraction, message: string, isSent: boolean = false) => {
    const replied = isSent ? await interaction.editReply({
        content: message,
    }) : await interaction.reply({
        content: message,
        fetchReply: true
    })
    await replied.react("❌")
    return
}

export const isValidUrl = (s: string)  => {
    try {
        new url.URL(s);
        return true
    } catch (e) {
        return false
    }
}

export const checkValidCommand = (str: string, prefix: string) => {
    let count = 0;
    for (const strElement of str) {
        if (strElement === prefix) {
            count++
        }
    }
    return count === 1
}

export const trimString = (str: string, max: number) => {
    if (str) {
        return ((str.length > max) ? `${str.slice(0, max - 3)}...` : str)
    }
    return str
}