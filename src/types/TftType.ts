export interface TftTrait {
    stack: "chromatic" | "gold" | "silver" | "bronze";
    url: string,
    isHeadliner: boolean
}

export interface Champion {
    name: string;
    cost: string;
    url: string;
    isHeadliner: boolean;
    items: string[] | undefined
}

export interface TftType {
    metaName: string;
    traits: TftTrait[];
    champions: Champion[]
    cost: string;
    builder: string
}