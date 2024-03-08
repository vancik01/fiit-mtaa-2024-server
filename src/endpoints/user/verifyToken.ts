import { Request, Response } from "express";

export const verifyToken = (req: Request, res: Response) => {
    res.status(200).send();
};
