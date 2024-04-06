import { EventAssignmentStatus, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";
import { UserDecodedData } from "../../../../@types/jwtToken";

const prisma = new PrismaClient();

export const getEventDetail = async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const userData = req.user as UserDecodedData;

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
                EventAssignment: {
                    where: {
                        userId: userData.id,
                        assignmentStatus: EventAssignmentStatus.ACTIVE
                    }
                },
                _count: {
                    select: {
                        EventAssignment: {
                            where: {
                                assignmentStatus: EventAssignmentStatus.ACTIVE
                            }
                        }
                    }
                },
                User: {
                    select: {
                        name: true,
                        id: true
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
        const isOwnedByUser = event.User.id === userData.id;
        const isUserSignedIn = event.EventAssignment.length === 1;

        return res.status(200).json({
            ...event,
            ...{
                User: {
                    ...event.User,
                    id: undefined
                }
            },
            EventAssignment: undefined,
            isOwnedByUser,
            isUserSignedIn
        });
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
