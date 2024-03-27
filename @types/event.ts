import { HarmonogramItem, SallaryType } from "@prisma/client";

/**
 * Request
 */
export interface CreateEventData {
    capacity: number;
    description?: string;
    happeningAt: Date;
    location: LocationData;
    name: string;
    sallaryAmount: number;
    sallaryProductName?: string;
    sallaryUnit?: string;
    sallaryType: SallaryType;
    thumbnailURL?: string;
    toolingProvided?: string;
    toolingRequired?: string;
    categories: [string];
    harmonogramItems: HarmonogramItemData[];
    [property: string]: any;
}

export interface LocationData {
    address: string;
    city: string;
    locationLat: number;
    locationLon: number;
    name?: string;
    [property: string]: any;
}

export interface HarmonogramItemData {
    title: string;
    description: string;
    from: string;
    to: string;
}
