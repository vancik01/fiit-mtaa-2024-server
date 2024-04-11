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

export const getEventReporting = async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const userData = req.user as UserDecodedData;

    try {
        const event = await prisma.event.findUnique({
            where: {
                id: eventId,
                status: EventStatus.ARCHIVED,
                OR: [
                    {
                        userId: userData.id // event created by user
                    },
                    {
                        EventAssignment: {
                            some: {
                                userId: userData.id,
                                assignmentStatus: EventAssignmentStatus.ACTIVE,
                                presenceStatus: EventPresenceStatus.LEFT
                            }
                        }
                    }
                ]
            }
        });

        if (!event) {
            return ThrowNotFound(res);
        }

        const reporting = await prisma.eventAssignment.findMany({
            where: {
                eventId: eventId,
                event: {
                    status: EventStatus.ARCHIVED
                },
                assignmentStatus: EventAssignmentStatus.ACTIVE,
                presenceStatus: EventPresenceStatus.LEFT,

                ...(userData.role === AccountType.HARVESTER && {
                    userId: userData.id
                })
            },
            select: {
                arrivedAt: true,
                leftAt: true,
                hoursWorked: true,
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return res.status(200).send({
            reportingItems: reporting
        });
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
