import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";

const prisma = new PrismaClient();

export const getPopularEvents = async (req: Request, res: Response) => {
    console.log(1);

    try {
        const events = await prisma.event.findMany({
            take: 5,
            select: {
                id: true,
                name: true,
                happeningAt: true,
                thumbnailURL: true,
                Location: true,
                capacity: true,
                sallaryType: true,
                toolingRequired: true,
                toolingProvided: true,
                status: true,
                sallaryAmount: true,
                sallaryProductName: true,
                sallaryUnit: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        if (events.length == 0) {
            return ThrowNotFound(res);
        }

        return res.status(200).send({ events: events });
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
