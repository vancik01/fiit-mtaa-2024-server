import { PrismaClient, Prisma, SallaryType, EventStatus } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";

const prisma = new PrismaClient();

export const getAssignedCategories = async (req: Request, res: Response) => {
    try {
        // const categories = await prisma.eventCategoryRelation.findMany({
        //     where: {
        //         Event: {
        //             status: EventStatus.CREATED
        //         }
        //     },
        //     include: {
        //         EventCategory: {
        //             include: {
        //                 _count: {
        //                     select: {
        //                         EventCategoryRelation: true
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // });
        const categories = await prisma.eventCategory.findMany({
            where: {
                EventCategoryRelation: {
                    some: {
                        Event: {
                            status: EventStatus.CREATED
                        }
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        EventCategoryRelation: true
                    }
                }
            }
        });

        return res.status(200).json({
            categories: categories.map((category) => ({
                ...category,
                createdAt: undefined
            }))
        });
    } catch (error) {
        console.log(error);
        return ThrowInternalServerError(res);
    }
};
