import { EventStatus, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";
import { ThrowNotFound } from "../../../errorResponses/notFound404";

const prisma = new PrismaClient();

export const softDelEvent = async (req: Request, res: Response) => {
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
                deletedAt: new Date(),
                status: EventStatus.CANCELLED
            }
        });

        return res.status(200).send();
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
