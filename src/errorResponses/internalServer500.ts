import { Response } from "express";

export const ThrowInternalServerError = (res: Response) => {
    res.status(500).json({
        message: "That's not your fault, we are working on repair.",
        code: "SERVER_ERROR"
    });
};
