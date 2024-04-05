import {
    AccountType,
    EventAssignmentStatus,
    EventStatus,
    PrismaClient
} from "@prisma/client";
import { Request, Response } from "express";
import { ThrowInternalServerError } from "../../../../errorResponses/internalServer500";
import { ThrowNotFound } from "../../../../errorResponses/notFound404";
import { UserDecodedData } from "../../../../../@types/jwtToken";
import { ThrowUnauthorized } from "../../../../errorResponses/unauthorized401";
import { ThrowForbidden } from "../../../../errorResponses/forbidden403";

const prisma = new PrismaClient();

export const getEventWorkers = async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const userData = req.user as UserDecodedData;

    if (userData.role !== AccountType.ORGANISER) {
        return ThrowForbidden(res);
    }

    try {
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            }
        });

        if (!event) {
            return ThrowNotFound(res);
        }

        if (event.userId !== userData.id) {
            return ThrowForbidden(res);
        }

        const workers = await prisma.eventAssignment.findMany({
            where: {
                eventId: eventId,
                assignmentStatus: EventAssignmentStatus.ACTIVE
            },
            select: {
                assignmentStatus: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        phoneNumber: true
                    }
                }
            }
        });

        console.log(workers);

        return res.status(200).json({ workers: workers });
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
