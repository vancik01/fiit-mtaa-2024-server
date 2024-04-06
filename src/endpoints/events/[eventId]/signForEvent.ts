import {
    AccountType,
    EventAssignmentStatus,
    EventStatus,
    PrismaClient
} from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";
import { UserDecodedData } from "../../../../@types/jwtToken";
import { ThrowConflict } from "../../../errorResponses/conflict409";
import { ThrowForbidden } from "../../../errorResponses/forbidden403";

const prisma = new PrismaClient();

export const signForEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const userData = req.user as UserDecodedData;

    try {
        if (userData.role == AccountType.ORGANISER) {
            return ThrowForbidden(res);
        }

        const event = await prisma.event.findUnique({
            select: {
                id: true,
                capacity: true
            },
            where: {
                id: eventId,
                status: EventStatus.CREATED
            }
        });

        if (!event) {
            return ThrowNotFound(res);
        }

        const alreadyAssigned = await prisma.event.findUnique({
            where: {
                id: eventId,
                status: EventStatus.CREATED,
                EventAssignment: {
                    some: {
                        assignmentStatus: EventAssignmentStatus.ACTIVE,
                        user: {
                            id: userData.id
                        }
                    }
                }
            }
        });

        if (alreadyAssigned) {
            return ThrowForbidden(res);
        }

        const eventAssCount = await prisma.event.findUnique({
            select: {
                _count: {
                    select: {
                        EventAssignment: true
                    }
                }
            },
            where: {
                id: eventId
            }
        });

        if (eventAssCount?._count.EventAssignment === event.capacity) {
            return ThrowConflict(res);
        }

        await prisma.eventAssignment.create({
            data: {
                userId: userData.id,
                eventId: event.id
            }
        });

        return res.status(200).send();
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
