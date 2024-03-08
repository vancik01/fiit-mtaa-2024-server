import md5 from "md5";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({
            message: "Incorrect",
            code: ""
        });
        return;
    }

    const user = await prisma.user.findFirst({
        where: {
            email: email
        },
        select: {
            id: true,
            email: true,
            password: true,
            type: true
        }
    });

    if (user === null) {
        res.status(403).json({
            message: "User with email does not exist",
            status: "UNKNOWN_USER"
        });
        return;
    }

    const HASHpassword = md5(password);
    if (user.password !== HASHpassword) {
        res.status(403).json({
            message: "Password incorrect",
            status: "PASSWORD_INCORRECT"
        });
        return;
    }

    const accessToken = jwt.sign(
        {
            userID: user.id,
            role: user.type
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "1d"
        }
    );

    res.status(200).send({
        token: accessToken
    });
};
