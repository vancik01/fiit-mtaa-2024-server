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
import moment from "moment";

const prisma = new PrismaClient();

export const endEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const userData = req.user as UserDecodedData;

    try {
        if (userData.role != AccountType.ORGANISER) {
            return ThrowForbidden(res);
        }

        const event = await prisma.event.findUnique({
            where: {
                id: eventId,
                userId: userData.id,
                status: EventStatus.PROGRESS
            }
        });

        if (!event) {
            return ThrowNotFound(res);
        }

        const qwe = await prisma.eventAssignment.findMany({
            where: {
                eventId: eventId,
                presenceStatus: {
                    in: [EventPresenceStatus.LEFT]
                }
            }
        });

        await prisma.eventAssignment.updateMany({
            where: {
                eventId: eventId,
                presenceStatus: EventPresenceStatus.PRESENT,
                assignmentStatus: EventAssignmentStatus.ACTIVE
            },
            data: {
                presenceStatus: EventPresenceStatus.LEFT,
                leftAt: new Date()
            }
        });

        const assignmentIds = await prisma.eventAssignment.findMany({
            where: {
                presenceStatus: EventPresenceStatus.LEFT,
                assignmentStatus: EventAssignmentStatus.ACTIVE
            }
        });

        await Promise.all(
            assignmentIds.map(async (assignment) => {
                const hours_worked =
                    moment(assignment.leftAt).diff(
                        moment(assignment.arrivedAt),
                        "hours"
                    ) + 1;
                console.log(assignment, hours_worked);
                await prisma.eventAssignment.update({
                    where: {
                        id: assignment.id
                    },
                    data: {
                        hoursWorked: hours_worked > 0 ? hours_worked : 0
                    }
                });
            })
        );

        await prisma.event.update({
            where: {
                id: eventId
            },
            data: {
                status: EventStatus.ARCHIVED
            }
        });

        return res.status(200).send();
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
