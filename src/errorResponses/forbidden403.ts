import { Response } from "express";

export const ThrowForbidden = (res: Response) => {
    res.status(403).send({
        message: "You do not have access to this resource",
        code: "FORBIDDEN"
    });
};
