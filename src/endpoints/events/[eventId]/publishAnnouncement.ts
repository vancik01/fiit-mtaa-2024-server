import { AccountType, EventStatus, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";
import { ThrowNotFound } from "../../../errorResponses/notFound404";
import { UserDecodedData } from "../../../../@types/jwtToken";
import { ThrowBadRequest } from "../../../errorResponses/badRequest400";
import { EventConnections } from "../../../../@types/websockets";
import { sendMessageToEventWithId } from "../../../../helpers/sendMessageToEventRoom";
import { ThrowForbidden } from "../../../errorResponses/forbidden403";

const prisma = new PrismaClient();

export const publishAnnouncement = async (
    req: Request,
    res: Response,
    eventConnections: EventConnections
) => {
    const { eventId } = req.params;
    const userData = req.user as UserDecodedData;
    const { message } = req.body;

    if (!message || message === "") {
        return ThrowBadRequest(res);
    }
    if (userData.role !== AccountType.ORGANISER) {
        return ThrowForbidden(res);
    }

    try {
        const event = await prisma.event.findUnique({
            where: {
                id: eventId,
                status: EventStatus.PROGRESS,
                userId: userData.id
            }
        });

        if (!event) {
            return ThrowNotFound(res);
        }

        const createdMessage = await prisma.announcementItem.create({
            data: {
                eventId: eventId,
                message: message,
                userId: userData.id
            }
        });

        if (Object.keys(eventConnections).includes(eventId)) {
            sendMessageToEventWithId(
                eventId,
                eventConnections,
                JSON.stringify({
                    message: message,
                    createdAt: createdMessage.createdAt
                })
            );
        }
        res.status(200).send();
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
