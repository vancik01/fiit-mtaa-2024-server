import { EventStatus, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";
import { ThrowNotFound } from "../../../errorResponses/notFound404";

const prisma = new PrismaClient();

export const startEvent = async (req: Request, res: Response) => {
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

        await prisma.event.update({
            where: {
                id: eventId
            },
            data: {
                status: EventStatus.PROGRESS
            }
        });

        return res.status(200).send();
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
