import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowBadRequest } from "../../errorResponses/badRequest400";
import { UserDecodedData } from "../../../@types/jwtToken";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";
import { ThrowNotFound } from "../../errorResponses/notFound404";

const prisma = new PrismaClient();

export const deleteAccount = async (req: Request, res: Response) => {
    const userData = req.user as UserDecodedData;
    try {
        const user = await prisma.user.update({
            where: {
                id: userData.id
            },
            data: {
                avatarURL: "",
                email: "unknown@grabit.sk",
                name: "Unknown user",
                phoneNumber: "unknown",
                deletedAt: new Date()
            }
        });

        if (!user) {
            return ThrowNotFound(res);
        }
    } catch (error) {
        console.log(error);
        ThrowInternalServerError(res);
        return;
    }
    res.status(200).send();
};
