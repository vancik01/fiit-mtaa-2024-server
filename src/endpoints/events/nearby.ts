import { EventStatus, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";
import { Coordinates } from "../../../helpers/distance";

const prisma = new PrismaClient();

type DistanceResponse = {
    id: string;
};

export const getNearbyEvents = async (req: Request, res: Response) => {
    const { lat, lon } = req.body;

    const eventIds: Array<DistanceResponse> = await prisma.$queryRaw`
        SELECT e.id, 6371 * acos(
                    cos(radians(${lat}))
                        * cos(radians("locationLat"))
                        * cos(radians("locationLon") - radians(${lon}))
                        + sin(radians(${lat})) * sin(radians("locationLat"))
                    ) as "distance"
        FROM "Event" e
                JOIN "Location" l on l.id = e."locationId"
        WHERE e."happeningAt" > now() AND status = 'CREATED'
        ORDER BY "distance"
        LIMIT 5;`;

    try {
        const events = await prisma.event.findMany({
            take: 5,
            select: {
                id: true,
                name: true,
                happeningAt: true,
                thumbnailURL: true,
                Location: true,
                sallaryType: true,
                status: true,
                sallaryAmount: true,
                sallaryProductName: true,
                sallaryUnit: true,
                EventCategoryRelation: {
                    select: {
                        EventCategory: {
                            select: {
                                id: true,
                                name: true,
                                icon: true,
                                colorVariant: true
                            }
                        }
                    }
                },
                User: {
                    select: {
                        name: true
                    }
                }
            },
            where: {
                status: EventStatus.CREATED,
                happeningAt: {
                    gt: new Date()
                },
                id: {
                    in: eventIds.map((e) => e.id)
                }
            },
            orderBy: [
                {
                    createdAt: "desc"
                },
                {
                    name: "asc"
                }
            ]
        });

        if (events.length == 0) {
            return ThrowNotFound(res);
        }

        return res.status(200).send({ events: events });
    } catch (error) {
        console.log(error);
        return ThrowInternalServerError(res);
    }
};
