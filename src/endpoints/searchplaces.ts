import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowBadRequest } from "../errorResponses/badRequest400";
import { ThrowInternalServerError } from "../errorResponses/internalServer500";
import axios from "axios";

import { Client, Language } from "@googlemaps/google-maps-services-js";

const prisma = new PrismaClient();

export const searchPlaces = async (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q || q === "") {
        return ThrowBadRequest(res);
    }

    try {
        const client = new Client();
        const autocompleteRes = await client.placeQueryAutocomplete({
            params: {
                key: process.env.GOOGLE_MAPS_API_KEY as string,
                input: q as string,
                radius: 400,
                location: {
                    lat: 48.6737532,
                    lng: 19.696058
                },
                language: Language.sk
            }
        });
        const results = autocompleteRes.data.predictions.filter(
            (val) => "place_id" in val
        );

        res.json({
            items: results.map((result) => {
                if (result.structured_formatting) {
                    return {
                        //@ts-ignore
                        mainText: result.structured_formatting.main_text,
                        secondaryText:
                            //@ts-ignore
                            result.structured_formatting.secondary_text,
                        placeId: result.place_id
                    };
                }
            })
        });
    } catch (error) {
        console.error("Error fetching data from Google Places API:", error);
        return ThrowInternalServerError(res);
    }
};
