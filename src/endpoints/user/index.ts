import md5 from "md5";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowBadRequest } from "../../errorResponses/badRequest400";
import { ThrowNotFound } from "../../errorResponses/notFound404";
import { ThrowForbidden } from "../../errorResponses/forbidden403";
import { UserDecodedData } from "../../../@types/jwtToken";

const prisma = new PrismaClient();

export const getUser = async (req: Request, res: Response) => {
    const userData = req.user as UserDecodedData;
    try {
        const user = await prisma.user.findFirst({
            where: {
                id: userData.id
            },
            select: {
                id: true,
                avatarURL: true,
                createdAt: true,
                email: true,
                name: true,
                phoneNumber: true,
                type: true
            }
        });
        res.status(200).send(user);
    } catch (error) {
        ThrowNotFound(res);
        return;
    }
};
