import { PrismaClient, SallaryType } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";

const prisma = new PrismaClient();

type DistanceResponse = {
    id: string;
};

export const getEvents = async (req: Request, res: Response) => {
    const { limit, categoryID, priceType, distance, lat, lon } = req.query;

    var eventIds: Array<DistanceResponse> = [];

    if (distance && lat && lon) {
        try {
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
            ORDER BY events.distance;`;
        } catch (error) {
            return ThrowInternalServerError(res);
        }
    }

    try {
        // TODO: support multi category

        const events = await prisma.event.findMany({
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
                status: "CREATED",
                ...(priceType
                    ? {
                          sallaryType:
                              priceType.toString() == "MONEY"
                                  ? SallaryType.MONEY
                                  : SallaryType.GOODS
                      }
                    : undefined),
                ...(categoryID
                    ? {
                          EventCategoryRelation: {
                              some: {
                                  eventCategoryId: {
                                      equals: categoryID.toString()
                                  }
                              }
                          }
                      }
                    : undefined),
                ...(distance != null
                    ? {
                          id: {
                              in: eventIds.map((e) => e.id)
                          }
                      }
                    : undefined)
            },
            take: limit ? parseInt(limit.toString()) : undefined,
            orderBy: { createdAt: "desc" }
        });

        return res.status(200).json({ events: events });
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
