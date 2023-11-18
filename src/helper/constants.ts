import {APIApplicationCommandOptionChoice} from "discord.js";

export const onlyLetterRegex: RegExp = /^[a-zA-Z]+$/
export const PARAM_INDEX = 1
export const DEFAULT_INDEX = 0
export const NYAASI_FILTER_ARR: APIApplicationCommandOptionChoice<string>[] = [
    {
        name: "No filter",
        value: "0"
    },
    {
        name: "No remakes",
        value: "1"
    },
    {
        name: "Trusted only",
        value: "2"
    }
]

export const NYAASI_CATEGORY_ARR: APIApplicationCommandOptionChoice<string>[] = [
    {
        name: "All category",
        value: "0_0"
    },
    {
        name: "Anime",
        value: "1_0"
    },
    {
        name: "Anime - AMV",
        value: "1_1"
    },
    {
        name: "Anime - English-translated",
        value: "1_2"
    },
    {
        name: "Anime - Non-English-translated",
        value: "1_3"
    },
    {
        name: "Anime - Raw",
        value: "1_4"
    },
    {
        name: "Audio",
        value: "2_0"
    },
    {
        name: "Audio - Lossless",
        value: "2_1"
    },
    {
        name: "Audio - Lossy",
        value: "2_2"
    },
    {
        name: "Literature",
        value: "3_0"
    },
    {
        name: "Literature - English-translated",
        value: "3_1"
    },
    {
        name: "Literature - Non-English-translated",
        value: "3_2"
    },
    {
        name: "Literature - Raw",
        value: "3_3"
    },
    {
        name: "Live action",
        value: "4_0"
    },
    {
        name: "Live action - English-translated",
        value: "4_1"
    },
    {
        name: "Live action - Idol/Promotional Video",
        value: "4_2"
    },
    {
        name: "Live action - Non-English-translated",
        value: "4_3"
    },
    {
        name: "Live action - Raw",
        value: "4_4"
    },
    {
        name: "Pictures",
        value: "5_0"
    },
    {
        name: "Pictures - Graphics",
        value: "5_1"
    },
    {
        name: "Pictures - Photos",
        value: "5_2"
    },
    {
        name: "Software",
        value: "6_0"
    },
    {
        name: "Software - Graphics",
        value: "6_1"
    },
    {
        name: "Software - Photos",
        value: "6_2"
    },
]