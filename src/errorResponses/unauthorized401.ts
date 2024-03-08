import { Response } from "express";

export const ThrowUnauthorized = (res: Response) => {
    res.status(401).send({
        message: "Unauthorized",
        code: "UNAUTHORIZED"
    });
};
