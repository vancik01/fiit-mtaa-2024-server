import {
    AccountType,
    EventAssignmentStatus,
    EventStatus,
    PrismaClient
} from "@prisma/client";
import { Request, Response } from "express";
import { ThrowNotFound } from "../../../errorResponses/notFound404";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";
import { UserDecodedData } from "../../../../@types/jwtToken";
import { ThrowForbidden } from "../../../errorResponses/forbidden403";

const prisma = new PrismaClient();

export const signOffEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const userData = req.user as UserDecodedData;

    console.log(userData);

    try {
        if (userData.role == AccountType.ORGANISER) {
            return ThrowForbidden(res);
        }

        const alreadyAssigned = await prisma.event.findUnique({
            where: {
                id: eventId,
                status: EventStatus.CREATED,
                EventAssignment: {
                    some: {
                        user: {
                            id: userData.id
                        },
                        assignmentStatus: EventAssignmentStatus.ACTIVE
                    }
                }
            }
        });

        if (!alreadyAssigned) {
            return ThrowNotFound(res);
        }

        await prisma.eventAssignment.updateMany({
            where: {
                AND: [
                    { assignmentStatus: EventAssignmentStatus.ACTIVE },
                    { eventId: eventId },
                    { userId: userData.id }
                ]
            },
            data: {
                assignmentStatus: EventAssignmentStatus.SIGNED_OFF,
                signedOffAt: new Date()
            }
        });

        return res.status(200).send();
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
