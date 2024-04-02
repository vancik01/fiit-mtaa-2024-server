import { EventStatus, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";
import { ThrowNotFound } from "../../../errorResponses/notFound404";

const prisma = new PrismaClient();

export const eventWorkersAttendance = async (req: Request, res: Response) => {
    const { eventId } = req.params;

    try {
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            }
        });

        if (!event) {
            return ThrowNotFound(res);
        }

        const workers = await prisma.eventAssignment.findMany({
            select: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                assignmentStatus: true,
                presenceStatus: true,
                arrivedAt: true,
                leftAt: true
            },
            where: {
                eventId: eventId,
                event: {
                    status: EventStatus.PROGRESS
                }
            }
        });

        if (workers.length == 0) {
            return ThrowNotFound(res);
        }

        return res.status(200).json({ workers: workers });
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
