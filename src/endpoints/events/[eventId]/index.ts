import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";

const prisma = new PrismaClient();

export const getEventDetail = async (req: Request, res: Response) => {
    const { eventId } = req.params;

    try {
        const event = await prisma.event.findUnique({
            select: {
                id: true,
                name: true,
                happeningAt: true,
                description: true,
                thumbnailURL: true,
                Location: true,
                sallaryType: true,
                status: true,
                sallaryAmount: true,
                sallaryProductName: true,
                sallaryUnit: true,
                toolingProvided: true,
                toolingRequired: true,
                capacity: true,
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
                _count: {
                    select: {
                        EventAssignment: true
                    }
                },
                User: {
                    select: {
                        name: true
                    }
                }
            },
            where: {
                id: eventId
            }
        });

        if (!event) {
            return ThrowNotFound(res);
        }

        return res.status(200).json(event);
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
