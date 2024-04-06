import { AccountType, EventStatus, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";
import { ThrowNotFound } from "../../../errorResponses/notFound404";
import { UserDecodedData } from "../../../../@types/jwtToken";
import { ThrowForbidden } from "../../../errorResponses/forbidden403";

const prisma = new PrismaClient();

export const startEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const userData = req.user as UserDecodedData;

    try {
        if (userData.role != AccountType.ORGANISER) {
            return ThrowForbidden(res);
        }

        const event = await prisma.event.findUnique({
            where: {
                id: eventId,
                userId: userData.id
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
