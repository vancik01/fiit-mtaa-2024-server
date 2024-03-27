import { AccountType, PrismaClient, SallaryType } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";
import { CreateEventData } from "../../../@types/event";
import { ThrowBadRequest } from "../../errorResponses/badRequest400";
import { UserDecodedData } from "../../../@types/jwtToken";
import moment from "moment";

const prisma = new PrismaClient();

export const createEvent = async (req: Request, res: Response) => {
    const data = req.body as CreateEventData;
    const userData = req.user as UserDecodedData;

    if (
        !data.name ||
        !data.capacity ||
        !data.happeningAt ||
        !data.location ||
        !data.sallaryType ||
        !data.sallaryAmount
    ) {
        return ThrowBadRequest(res);
    }

    if (
        data.sallaryType === SallaryType.GOODS &&
        (data.sallaryProductName === undefined ||
            data.sallaryUnit === undefined)
    ) {
        return ThrowBadRequest(res);
    }

    if (
        data.sallaryType === SallaryType.MONEY &&
        (data.sallaryProductName || data.sallaryUnit)
    ) {
        return ThrowBadRequest(res);
    }

    const sallaryObject =
        data.sallaryType === SallaryType.GOODS
            ? {
                  sallaryAmount: data.sallaryAmount,
                  sallaryUnit: data.sallaryUnit,
                  sallaryProductName: data.sallaryProductName
              }
            : {
                  sallaryAmount: data.sallaryAmount,
                  sallaryUnit: undefined,
                  sallaryProductName: undefined
              };

    try {
        const locationObject = await prisma.location.create({
            data: {
                address: data.location.address,
                city: data.location.city,
                locationLat: data.location.locationLat,
                locationLon: data.location.locationLon,
                name: data.location.name
            }
        });

        const event = await prisma.event.create({
            data: {
                name: data.name,
                capacity: data.capacity,
                happeningAt: data.happeningAt,
                sallaryType: data.sallaryType,
                ...sallaryObject,
                toolingProvided: data.toolingProvided,
                toolingRequired: data.toolingRequired,
                description: data.description,
                thumbnailURL: data.thumbnailURL,
                userId: userData.id,
                locationId: locationObject.id
            },
            select: {
                id: true
            }
        });

        if (data.categories && data.categories.length > 0) {
            try {
                await prisma.eventCategoryRelation.createMany({
                    data: data.categories.map((category) => ({
                        eventCategoryId: category,
                        eventId: event.id
                    }))
                });
            } catch (error) {
                return ThrowBadRequest(res);
            }
        }

        if (data.harmonogramItems && data.harmonogramItems.length > 0) {
            try {
                await prisma.harmonogramItem.createMany({
                    data: data.harmonogramItems.map((harmonogramItem) => {
                        return {
                            eventId: event.id,
                            from: harmonogramItem.from,
                            to: harmonogramItem.to,
                            title: harmonogramItem.title,
                            description: harmonogramItem.description
                        };
                    })
                });
            } catch (error) {
                console.log(error);
                return ThrowBadRequest(res);
            }
        }

        return res.status(200).json({ eventId: event.id });
    } catch (error) {
        console.log(error);
        return ThrowInternalServerError(res);
    }
};
