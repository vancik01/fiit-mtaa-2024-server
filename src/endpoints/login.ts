import md5 from "md5";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowBadRequest } from "../errorResponses/badRequest400";
import { ThrowNotFound } from "../errorResponses/notFound404";
import { ThrowForbidden } from "../errorResponses/forbidden403";
import { ThrowInternalServerError } from "../errorResponses/internalServer500";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        ThrowBadRequest(res);
        return;
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: email,
                deletedAt: null
            },
            select: {
                id: true,
                email: true,
                password: true,
                type: true,
                name: true,
                phoneNumber: true
            }
        });

        if (user === null) {
            ThrowNotFound(res);
            return;
        }

        const HASHpassword = md5(password);
        if (user.password !== HASHpassword) {
            ThrowForbidden(res);
            return;
        }

        const accessToken = jwt.sign(
            {
                id: user.id,
                role: user.type
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).send({
            token: accessToken,
            email: email,
            accountType: user.type,
            name: user.name,
            phoneNumber: user.phoneNumber
        });
    } catch (error) {
        return ThrowInternalServerError(res);
    }
};
