import {
    EventAssignmentStatus,
    EventPresenceStatus,
    EventStatus,
    PrismaClient
} from "@prisma/client";
import { EventConnections } from "../@types/websockets";
import { ThrowBadRequest } from "./errorResponses/badRequest400";
import { Response } from "express";
import { UserDecodedData } from "../@types/jwtToken";

const prisma = new PrismaClient();

export const websocketHandler = async (
    ws: any,
    req: any,
    eventConnections: EventConnections
) => {
    const { eventId } = req.params;
    const userData = req.user as UserDecodedData;

    if (!eventId || eventId === "") {
        return ws.disconnect();
    }

    const event = await prisma.event.findFirst({
        where: {
            id: eventId,
            status: EventStatus.PROGRESS,
            OR: [
                {
                    EventAssignment: {
                        some: {
                            userId: userData.id,
                            presenceStatus: EventPresenceStatus.PRESENT,
                            assignmentStatus: EventAssignmentStatus.ACTIVE
                        }
                    }
                },
                {
                    userId: userData.id
                }
            ]
        }
    });

    if (event === null) {
        return ws.disconnect();
    }

    if (!eventConnections[eventId]) {
        //@ts-ignore
        eventConnections[eventId] = [];
    }

    //@ts-ignore
    eventConnections[eventId].push(ws);

    ws.on("close", () => {
        // Remove the connection from the event group on disconnect
        eventConnections[eventId] = eventConnections[eventId].filter(
            //@ts-ignore
            (s) => s !== ws
        );
        if (eventConnections[eventId].length === 0) {
            delete eventConnections[eventId];
        }
    });
};
