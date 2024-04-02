import { Response } from "express";

export const ThrowConflict = (res: Response) => {
    res.status(409).send({
        message: "Conflict",
        code: "CONFLICT"
    });
};
