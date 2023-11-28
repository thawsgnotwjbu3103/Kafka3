export interface TftTrait {
    name: string;
    stack: "chromatic" | "gold" | "silver" | "bronze";
    url: string,
    isHeadline: boolean
}

export interface Champion {
    name: string;
    cost: string;
    url: string;
    items: string[] | undefined
}

export interface TftType {
    metaName: string;
    traits: TftTrait[];
    champions: Champion[]
    cost: string;
    builder: string
}