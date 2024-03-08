import { Response } from "express";

export const ThrowNotFound = (res: Response) => {
    res.status(404).send({
        message: "Not found",
        code: "NOT_FOUND"
    });
};
