import {
    AccountType,
    EventAssignmentStatus,
    EventPresenceStatus,
    EventStatus,
    PrismaClient
} from "@prisma/client";
import { Request, Response } from "express";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";
import { ThrowNotFound } from "../../../errorResponses/notFound404";
import { UserDecodedData } from "../../../../@types/jwtToken";
import { ThrowForbidden } from "../../../errorResponses/forbidden403";

const prisma = new PrismaClient();

export const getLiveEventData = async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const userData = req.user as UserDecodedData;

    try {
        const event = await prisma.event.findUnique({
            where: {
                id: eventId,
                status: EventStatus.PROGRESS,
                OR: [
                    {
                        userId: userData.id // event created by user
                    },
                    {
                        EventAssignment: {
                            some: {
                                userId: userData.id,
                                assignmentStatus: EventAssignmentStatus.ACTIVE,
                                presenceStatus: EventPresenceStatus.PRESENT
                            }
                        }
                    }
                ]
            }
        });

        if (!event) {
            return ThrowNotFound(res);
        }

        const harmonogramItems = await prisma.harmonogramItem.findMany({
            where: {
                eventId: eventId
            },
            orderBy: {
                from: "asc"
            }
        });

        const announcementItems = await prisma.announcementItem.findMany({
            where: {
                eventId: eventId
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        return res.status(200).send({
            announcementItems,
            harmonogramItems
        });
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
