import { EventStatus, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";

const prisma = new PrismaClient();

type DistanceResponse = {
    id: string;
};

export const getNearbyEvents = async (req: Request, res: Response) => {
    const { lat, lon } = req.query;

    var eventIds: Array<DistanceResponse> = [];

    const distance = 15.0;

    if (lat && lon) {
        eventIds = await prisma.$queryRaw`
        SELECT *
        FROM (SELECT e.id,
                    6371 * acos(
                            cos(radians(${parseFloat(lat.toString())}))
                                * cos(radians("locationLat"))
                                * cos(radians("locationLon") - radians(${parseFloat(
                                    lon.toString()
                                )}))
                                + sin(radians(${parseFloat(
                                    lat.toString()
                                )})) * sin(radians("locationLat"))
                            ) AS distance
            FROM "Event" e
                    JOIN "Location" l ON l.id = e."locationId"
            WHERE status = 'CREATED') AS events
        WHERE events.distance <= ${parseFloat(distance.toString())}
        ORDER BY events.distance
        LIMIT 5;`;
    }

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
        return ThrowInternalServerError(res);
    }
};
