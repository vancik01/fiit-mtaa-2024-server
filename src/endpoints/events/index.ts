import { PrismaClient, Prisma, SallaryType, EventStatus } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";

const prisma = new PrismaClient();

export const getEvents = async (req: Request, res: Response) => {
    const { limit, categoryID, priceType, distance } = req.query;

    try {
        let prismaQuery: Prisma.EventFindManyArgs = {
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
            orderBy: { createdAt: "desc" },
            where: {
                status: EventStatus.CREATED
            }
        };

        if (limit) {
            prismaQuery.take = parseInt(limit.toString());
        }

        // TODO: fix this and support multi category query
        if (categoryID) {
            prismaQuery.where = {
                ...prismaQuery.where,
                EventCategoryRelation: {
                    some: {
                        eventCategoryId: {
                            equals: categoryID.toString()
                        }
                    }
                }
            };
        }

        if (priceType) {
            prismaQuery.where = {
                ...prismaQuery.where,
                sallaryType:
                    priceType.toString() == "MONEY"
                        ? SallaryType.MONEY
                        : SallaryType.GOODS
            };
        }

        // TODO: distance filter

        const events = await prisma.event.findMany(prismaQuery);

        return res.status(200).json({ events: events });
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
