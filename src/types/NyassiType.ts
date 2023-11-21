export interface NyaasiType {
    category: string;
    name: string;
    link: NyaasiLink;
    size: string;
    date: string;
    seeders: number;
    leechers: number;
    downloads: number;
}

export interface NyaasiLink {
    torrent: string,
    magnet: string
}