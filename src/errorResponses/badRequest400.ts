import { Response } from "express";

export const ThrowBadRequest = (res: Response) => {
    res.status(400).send({
        message: "Bad request",
        code: "BAD_REQUEST"
    });
};
