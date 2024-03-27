import { AccountType, PrismaClient, SallaryType } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";
import { CreateEventData } from "../../../@types/event";
import { ThrowBadRequest } from "../../errorResponses/badRequest400";
import { UserDecodedData } from "../../../@types/jwtToken";
import moment from "moment";
import * as Yup from "yup";
import { ThrowForbidden } from "../../errorResponses/forbidden403";

const prisma = new PrismaClient();

export const createEvent = async (req: Request, res: Response) => {
    const data = req.body as CreateEventData;
    const userData = req.user as UserDecodedData;

    if (userData.role !== "ORGANISER") {
        return ThrowForbidden(res);
    }

    const validationSchema = Yup.object<CreateEventData>({
        capacity: Yup.number().min(0).required(),
        description: Yup.string().nullable().required(),
        happeningAt: Yup.date().min(new Date()).required(),
        location: Yup.object({
            address: Yup.string().required(),
            city: Yup.string().required(),
            locationLat: Yup.number().required(),
            locationLon: Yup.number().required(),
            name: Yup.string().nullable()
        }),
        name: Yup.string().nullable(),
        sallaryAmount: Yup.number().min(0).required(),
        sallaryProductName: Yup.string().nullable(),
        sallaryUnit: Yup.string().nullable(),
        sallaryType: Yup.string().oneOf([SallaryType.GOODS, SallaryType.MONEY]),
        thumbnailURL: Yup.string().nullable(),
        toolingProvided: Yup.string().nullable(),
        toolingRequired: Yup.string().nullable(),
        categories: Yup.array(Yup.string().required()).nullable(),
        harmonogramItems: Yup.array(
            Yup.object({
                title: Yup.string().required(),
                description: Yup.string().required(),
                from: Yup.string().required(),
                to: Yup.string().required()
            }).required()
        ).nullable()
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

    try {
        const location = await prisma.location.create({
            data: {
                address: data.location.address,
                city: data.location.city,
                locationLat: data.location.locationLat,
                locationLon: data.location.locationLon,
                name: data.location.name
            }
        });

        const event = await prisma.event.create({
            data: {
                name: data.name,
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

        if (data.categories && data.categories.length > 0) {
            try {
                await prisma.eventCategoryRelation.createMany({
                    data: data.categories.map((category) => ({
                        eventCategoryId: category,
                        eventId: event.id
                    }))
                });
            } catch (error) {
                return ThrowBadRequest(res);
            }
        }

        if (data.harmonogramItems && data.harmonogramItems.length > 0) {
            try {
                await prisma.harmonogramItem.createMany({
                    data: data.harmonogramItems.map((harmonogramItem) => {
                        return {
                            eventId: event.id,
                            from: harmonogramItem.from,
                            to: harmonogramItem.to,
                            title: harmonogramItem.title,
                            description: harmonogramItem.description
                        };
                    })
                });
            } catch (error) {
                console.log(error);
                return ThrowBadRequest(res);
            }
        }

        return res.status(200).json({ eventId: event.id });
    } catch (error) {
        console.log(error);
        return ThrowInternalServerError(res);
    }
};
