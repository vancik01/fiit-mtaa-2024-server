import { Client, Language } from "@googlemaps/google-maps-services-js";

export async function getLocationDetail(placeId: string) {
    const client = new Client();
    return await client.placeDetails({
        params: {
            key: process.env.GOOGLE_MAPS_API_KEY as string,
            language: Language.sk,
            place_id: placeId,
            fields: ["address_components", "geometry", "name"]
        }
    });
}
