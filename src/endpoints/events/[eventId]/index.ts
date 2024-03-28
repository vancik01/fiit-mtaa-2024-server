import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";

const prisma = new PrismaClient();

export const getEventDetail = async (req: Request, res: Response) => {
    const { eventId } = req.params;

    try {
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            },
            include: {
                Location: true,
                User: {
                    select: {
                        name: true
                    }
                }
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
