import {
    AccountType,
    EventAssignmentStatus,
    PrismaClient
} from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";
import { UserDecodedData } from "../../../@types/jwtToken";

const prisma = new PrismaClient();

export const getMyEvents = async (req: Request, res: Response) => {
    const userData = req.user as UserDecodedData;

    try {
        const events = await prisma.event.findMany({
            select: {
                id: true,
                name: true,
                happeningAt: true,
                thumbnailURL: true,
                Location: true,
                sallaryType: true,
                sallaryAmount: true,
                sallaryUnit: true,
                sallaryProductName: true,
                status: true,
                User: {
                    select: {
                        name: true
                    }
                },
                EventCategoryRelation: {
                    select: {
                        EventCategory: {
                            select: {
                                id: true,
                                name: true,
                                icon: true,
                                colorVariant: true
                            }
                        }
                    }
                }
            },
            where: {
                ...(userData.role === AccountType.ORGANISER
                    ? {
                          userId: userData.id
                      }
                    : {
                          EventAssignment: {
                              some: {
                                  userId: userData.id,
                                  assignmentStatus: EventAssignmentStatus.ACTIVE
                              }
                          }
                      })
            },
            orderBy: [
                {
                    status: "desc"
                },
                {
                    createdAt: "desc"
                },
                {
                    name: "asc"
                }
            ]
        });

        // if (events.length == 0) {
        //     return ThrowNotFound(res);
        // }

        return res.status(200).send({ events: events });
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
