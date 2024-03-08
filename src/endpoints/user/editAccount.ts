import md5 from "md5";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowBadRequest } from "../../errorResponses/badRequest400";
import { ThrowNotFound } from "../../errorResponses/notFound404";
import { ThrowForbidden } from "../../errorResponses/forbidden403";
import { UserDecodedData } from "../../../@types/jwtToken";

const prisma = new PrismaClient();

export const editAccount = async (req: Request, res: Response) => {
    const { name, avatarURL, phoneNumber } = req.body;

    if (!name && !avatarURL && !phoneNumber) {
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
                name: name
                // TODO: ADD FIELDS TO UPDATE
            }
        });
    } catch (error) {
        ThrowNotFound(res);
        return;
    }

    // console.log(update);

    res.status(200).send();
};
