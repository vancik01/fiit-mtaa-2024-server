import { Request, Response } from "express";

export const verifyToken = (req: Request, res: Response) => {
    // TODO: Validate if user exists in DB
    res.status(200).send();
};
