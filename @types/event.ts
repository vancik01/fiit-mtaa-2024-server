import { EventPresenceStatus, SallaryType } from "@prisma/client";

/**
 * Request
 */
export type CreateEventData = {
    capacity: number;
    description?: string;
    happeningAt: Date;
    placeId: string;
    name: string;
    sallaryAmount: number;
    sallaryProductName?: string;
    sallaryUnit?: string;
    sallaryType: SallaryType;
    thumbnailURL?: string;
    toolingProvided?: string;
    toolingRequired?: string;
    categories: [string];
    harmonogramItems: CreateHarmonogramItemData[];
    [property: string]: any;
};

export type UpdateEventData = {
    capacity: number;
    description?: string;
    happeningAt: Date;
    placeId?: string;
    name: string;
    sallaryAmount: number;
    sallaryProductName?: string;
    sallaryUnit?: string;
    sallaryType: SallaryType;
    thumbnailURL?: string;
    toolingProvided?: string;
    toolingRequired?: string;
    categories: [string];
    harmonogramItems: CreateHarmonogramItemData[];
    [property: string]: any;
};

export interface LocationData {
    address: string;
    city: string;
    locationLat: number;
    locationLon: number;
    name?: string;
    [property: string]: any;
}

export interface CreateHarmonogramItemData {
    title: string;
    description: string;
    from: string;
    to: string;
}

export interface AttendanceItemData {
    userID: string;
    presenceStatus: EventPresenceStatus;
    arrivedAt: string;
    leftAt: string;
}
