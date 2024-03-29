import md5 from "md5";
import jwt from "jsonwebtoken";
import { AccountType, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowBadRequest } from "../errorResponses/badRequest400";
import { ThrowNotFound } from "../errorResponses/notFound404";
import { ThrowForbidden } from "../errorResponses/forbidden403";

const prisma = new PrismaClient();

export const createAccount = async (req: Request, res: Response) => {
    const { email, password, accountType, name, phoneNumber } = req.body;

    if (!email || !password || !accountType || !name) {
        ThrowBadRequest(res);
        return;
    }

    const userExists = await prisma.user.findFirst({
        where: {
            email: email
        }
    });

    if (userExists !== null) {
        res.status(409).json({
            message: "Email already in use",
            code: "EMAIL_IN_USE"
        });
        return;
    }

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: md5(password),
            type: accountType,
            phoneNumber
        },
        select: {
            id: true
        }
    });

    const accessToken = jwt.sign(
        {
            id: user.id,
            role: accountType
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "1d"
        }
    );

    res.status(200).send({
        token: accessToken,
        email: email,
        accountType: accountType,
        name: name,
        phoneNumber: phoneNumber
    });
};
