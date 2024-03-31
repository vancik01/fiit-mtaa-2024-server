import {
    AccountType,
    EventPresenceStatus,
    EventStatus,
    PrismaClient
} from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";
import { UserDecodedData } from "../../../@types/jwtToken";

const prisma = new PrismaClient();

export const getActiveEvent = async (req: Request, res: Response) => {
    const userData = req.user as UserDecodedData;

    try {
        const myActiveEvent = await prisma.event.findFirst({
            select: {
                id: true,
                thumbnailURL: true,
                name: true,
                User: {
                    select: {
                        name: true
                    }
                }
            },
            where: {
                ...(userData.role === AccountType.HARVESTER
                    ? {
                          AND: [
                              {
                                  EventAssignment: {
                                      some: {
                                          userId: userData.id,
                                          presenceStatus:
                                              EventPresenceStatus.PRESENT
                                      }
                                  }
                              },
                              {
                                  status: EventStatus.PROGRESS
                              }
                          ]
                      }
                    : {
                          AND: [
                              {
                                  userId: userData.id
                              },
                              {
                                  status: EventStatus.PROGRESS
                              }
                          ]
                      })
            }
        });

        if (!myActiveEvent) {
            return ThrowNotFound(res);
        }

        return res.status(200).json(myActiveEvent);
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
