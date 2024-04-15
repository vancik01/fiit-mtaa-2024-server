import { EventPresenceStatus, EventStatus, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";
import { ThrowNotFound } from "../../../errorResponses/notFound404";
import { ThrowForbidden } from "../../../errorResponses/forbidden403";
import { AttendanceItemData } from "../../../../@types/event";
import * as Yup from "yup";
import { ThrowBadRequest } from "../../../errorResponses/badRequest400";
import { UserDecodedData } from "../../../../@types/jwtToken";

const prisma = new PrismaClient();

function validateAttendance(workers: Array<AttendanceItemData>) {
    for (const worker of workers) {
        if (worker.presenceStatus === "PRESENT") {
            if (!worker.arrivedAt) {
                return false;
            }
            if (worker.leftAt) {
                return false;
            }
        } else if (worker.presenceStatus === "LEFT") {
            if (!worker.arrivedAt || !worker.leftAt) {
                return false;
            }
            if (Date.parse(worker.arrivedAt) > Date.parse(worker.leftAt)) {
                return false;
            }
        }
    }
    return true;
}

export const eventUpdateAttendance = async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const userData = req.user as UserDecodedData;
    const data = req.body as { workers: Array<AttendanceItemData> };

    if (userData.role !== "ORGANISER") {
        return ThrowForbidden(res);
    }

    const validationSchema = Yup.object<Array<AttendanceItemData>>({
        userID: Yup.string().required(),
        presenceStatus: Yup.string()
            .oneOf([
                EventPresenceStatus.DID_NOT_ARRIVE,
                EventPresenceStatus.LEFT,
                EventPresenceStatus.NOT_PRESENT,
                EventPresenceStatus.PRESENT
            ])
            .required(),
        arrivedAt: Yup.string(),
        leftAt: Yup.string()
    });

    try {
        data.workers.map((worker) => {
            validationSchema.validateSync(worker, {
                abortEarly: false
            });
        });
    } catch (error) {
        return ThrowBadRequest(res);
    }

    if (!validateAttendance(data.workers)) {
        return ThrowBadRequest(res);
    }

    try {
        const event = await prisma.event.findUnique({
            where: {
                id: eventId,
                status: EventStatus.PROGRESS
            }
        });

        if (!event) {
            return ThrowNotFound(res);
        }

        const assignments = await prisma.eventAssignment.findMany({
            where: {
                eventId: eventId,
                event: {
                    status: EventStatus.PROGRESS
                }
            }
        });

        if (assignments.length == 0) {
            await prisma.eventAssignment.createMany({
                data: data.workers.map((worker) => ({
                    eventId: eventId,
                    userId: worker.userID,
                    arrivedAt: worker.arrivedAt,
                    leftAt: worker.leftAt,
                    presenceStatus: worker.presenceStatus
                }))
            });
        } else {
            data.workers.map(async (worker) => {
                await prisma.eventAssignment.updateMany({
                    where: {
                        userId: worker.userID,
                        eventId: eventId,
                        event: {
                            status: EventStatus.PROGRESS
                        }
                    },
                    data: {
                        updatedAt: new Date(),
                        arrivedAt: worker.arrivedAt,
                        leftAt: worker.leftAt,
                        presenceStatus: worker.presenceStatus
                    }
                });
            });
        }

        return res.status(200).json();
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
