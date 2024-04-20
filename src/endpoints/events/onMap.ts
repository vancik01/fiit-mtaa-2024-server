import { EventStatus, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";

const prisma = new PrismaClient();

export const getOnMap = async (req: Request, res: Response) => {
    try {
        const eventsLocations = await prisma.event.findMany({
            where: {
                status: EventStatus.CREATED
            },
            select: {
                id: true,
                Location: {
                    select: {
                        locationLat: true,
                        locationLon: true
                    }
                }
            }
        });

        return res.status(200).send({ events: eventsLocations });
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
