import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ThrowInternalServerError } from "../../../errorResponses/internalServer500";
import { ThrowNotFound } from "../../../errorResponses/notFound404";
import { Multer } from "multer";
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";
import { ThrowBadRequest } from "../../../errorResponses/badRequest400";
// Instantiate a storage client with credentials
const prisma = new PrismaClient();

export const uploadEventImage = async (req: Request, res: Response) => {
    const storage = new Storage({
        projectId: "mtaa-2024",
        keyFilename: "google-cloud-key.json"
    });
    if (!req.file) {
        return ThrowBadRequest(res);
    }
    try {
        const bucket = storage.bucket(process.env.BUCKET_NAME as string);
        const uniqueName = `uploads/${randomUUID()}-${req.file.originalname}`;
        const file = bucket.file(uniqueName, {
            preconditionOpts: {}
        });

        const stream = require("stream");
        const passthroughStream = new stream.PassThrough();

        passthroughStream.write(req.file.buffer);
        passthroughStream.end();

        await passthroughStream
            .pipe(file.createWriteStream())
            .on("finish", async () => {
                await file.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
                res.status(200).send({ imageURL: publicUrl });
            });
    } catch (error) {
        console.log(error);
        return ThrowInternalServerError(res);
    }
};
