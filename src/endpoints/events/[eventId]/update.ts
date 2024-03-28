import { AccountType, PrismaClient, SallaryType } from "@prisma/client";
import { Request, Response } from "express";
import moment from "moment";
import * as Yup from "yup";
import { CreateEventData, UpdateEventData } from "../../../../@types/event";
import { UserDecodedData } from "../../../../@types/jwtToken";
import { ThrowForbidden } from "../../../errorResponses/forbidden403";
import { ThrowBadRequest } from "../../../errorResponses/badRequest400";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";
import { ThrowNotFound } from "../../../errorResponses/notFound404";
import { getArrayDifference } from "../../../../helpers/arrayDifference";

const prisma = new PrismaClient();

export const updateEvent = async (req: Request, res: Response) => {
    const data = req.body as UpdateEventData;
    const userData = req.user as UserDecodedData;

    const { eventId } = req.params;

    if (!eventId) {
        return ThrowBadRequest(res);
    }

    if (userData.role !== "ORGANISER") {
        return ThrowForbidden(res);
    }

    const validationSchema = Yup.object<UpdateEventData>({
        capacity: Yup.number().required().min(0),
        description: Yup.string().nullable(),
        happeningAt: Yup.date().required().min(new Date()),
        location: Yup.object({
            address: Yup.string().required(),
            city: Yup.string().required(),
            locationLat: Yup.number().required(),
            locationLon: Yup.number().required(),
            name: Yup.string().nullable()
        }).required(),
        name: Yup.string().nullable(),
        sallaryAmount: Yup.number().required().min(0),
        sallaryProductName: Yup.string().nullable(),
        sallaryUnit: Yup.string().nullable(),
        sallaryType: Yup.string()
            .required()
            .oneOf([SallaryType.GOODS, SallaryType.MONEY]),
        thumbnailURL: Yup.string().nullable(),
        toolingProvided: Yup.string().nullable(),
        toolingRequired: Yup.string().nullable(),
        categories: Yup.array(Yup.string().required()),
        harmonogramItems: Yup.array(
            Yup.object({
                title: Yup.string().required(),
                description: Yup.string().required(),
                from: Yup.string().required(),
                to: Yup.string().required()
            }).required()
        ).required()
    });

    try {
        validationSchema.validateSync(data, {
            abortEarly: false
        });
    } catch (error) {
        console.log((error as Yup.ValidationError).errors);
        return ThrowBadRequest(res);
    }

    if (
        data.sallaryType === SallaryType.GOODS &&
        (data.sallaryProductName === undefined ||
            data.sallaryUnit === undefined)
    ) {
        return ThrowBadRequest(res);
    }

    if (
        data.sallaryType === SallaryType.MONEY &&
        (data.sallaryProductName || data.sallaryUnit)
    ) {
        return ThrowBadRequest(res);
    }

    const oldEventObject = await prisma.event.findFirst({
        where: {
            userId: userData.id,
            id: eventId
        },
        include: {
            EventCategoryRelation: {
                select: {
                    eventCategoryId: true
                }
            },
            HarmonogramItem: {
                select: {
                    id: true
                }
            },
            Location: {
                select: {
                    id: true
                }
            },
            EventAssignment: {
                select: {
                    id: true
                }
            }
        }
    });

    if (oldEventObject === null) {
        return ThrowNotFound(res);
    }

    if (oldEventObject.EventAssignment.length > data.capacity) {
        return ThrowBadRequest(res);
    }

    const sallaryObject =
        data.sallaryType === SallaryType.GOODS
            ? {
                  sallaryAmount: data.sallaryAmount,
                  sallaryUnit: data.sallaryUnit,
                  sallaryProductName: data.sallaryProductName
              }
            : {
                  sallaryAmount: data.sallaryAmount,
                  sallaryUnit: undefined,
                  sallaryProductName: undefined
              };

    if (data.categories) {
        const categoriesExistCount = await prisma.eventCategory.count({
            where: {
                id: {
                    in: data.categories
                }
            }
        });

        if (categoriesExistCount !== data.categories.length) {
            return ThrowBadRequest(res);
        }
    }

    try {
        const location = await prisma.location.update({
            where: {
                id: oldEventObject.locationId
            },
            data: {
                address: data.location.address,
                city: data.location.city,
                locationLat: data.location.locationLat,
                locationLon: data.location.locationLon,
                name: data.location.name
            }
        });

        await prisma.event.update({
            where: {
                id: eventId,
                userId: userData.id
            },
            data: {
                capacity: data.capacity,
                happeningAt: data.happeningAt,
                sallaryType: data.sallaryType,
                ...sallaryObject,
                toolingProvided: data.toolingProvided,
                toolingRequired: data.toolingRequired,
                description: data.description,
                thumbnailURL: data.thumbnailURL,
                userId: userData.id,
                locationId: location.id
            },
            select: {
                id: true
            }
        });

        await prisma.eventCategoryRelation.deleteMany({
            where: {
                eventId: eventId
            }
        });

        await prisma.harmonogramItem.deleteMany({
            where: {
                eventId: eventId
            }
        });

        await prisma.eventCategoryRelation.createMany({
            data: data.categories.map((categoryId) => ({
                eventCategoryId: categoryId,
                eventId: eventId
            }))
        });

        await prisma.harmonogramItem.createMany({
            data: data.harmonogramItems.map((harmoogramItem) => ({
                ...harmoogramItem,
                eventId: eventId,
                id: undefined
            }))
        });

        return res.status(200).send();
    } catch (error) {
        console.log(error);
        return ThrowInternalServerError(res);
    }
};
