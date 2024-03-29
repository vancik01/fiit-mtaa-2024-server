import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowBadRequest } from "../../errorResponses/badRequest400";
import { UserDecodedData } from "../../../@types/jwtToken";
import { ThrowInternalServerError } from "../../errorResponses/internalServer500";

const prisma = new PrismaClient();

export const editAccount = async (req: Request, res: Response) => {
    const { name, phoneNumber } = req.body;
    console.log("Wocap");
    if (!name && !phoneNumber) {
        ThrowBadRequest(res);
        return;
    }

    const userData = req.user as UserDecodedData;
    try {
        await prisma.user.update({
            where: {
                id: userData.id
            },
            data: {
                name: name,
                phoneNumber: phoneNumber
            }
        });
    } catch (error) {
        ThrowInternalServerError(res);
        return;
    }
    res.status(200).send();
};
