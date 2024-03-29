import { EventStatus, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";

const prisma = new PrismaClient();

export const getLatestEvents = async (req: Request, res: Response) => {
    console.log(1);

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
