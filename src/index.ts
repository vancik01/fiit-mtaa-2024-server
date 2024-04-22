import express, { NextFunction, Request, Response, json } from "express";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
const morgan = require("morgan");
import { login } from "./endpoints/login";
import { createAccount } from "./endpoints/createAccount";
import { editAccount } from "./endpoints/user/editAccount";
import { UserDecodedData } from "../@types/jwtToken";
import { ThrowUnauthorized } from "./errorResponses/unauthorized401";
import { verifyToken } from "./endpoints/user/verifyToken";
import { getUser } from "./endpoints/user";
import { getEventDetail } from "./endpoints/events/[eventId]";
import { getLatestEvents } from "./endpoints/events/latest";
import { getEvents } from "./endpoints/events";
import { getActiveEvent } from "./endpoints/events/active";
import { uploadEventImage } from "./endpoints/events/[eventId]/uploadImage";
const cors = require("cors");
import { createEvent } from "./endpoints/events/create";
import { updateEvent } from "./endpoints/events/[eventId]/update";
import { getNearbyEvents } from "./endpoints/events/nearby";
import { startEvent } from "./endpoints/events/[eventId]/startEvent";
import { eventWorkersAttendance } from "./endpoints/events/[eventId]/attendance";
const swaggerUi = require("swagger-ui-express");
import { softDelEvent } from "./endpoints/events/[eventId]/delete";
import { signForEvent } from "./endpoints/events/[eventId]/signForEvent";
import { getMyEvents } from "./endpoints/events/my";
import { signOffEvent } from "./endpoints/events/[eventId]/signOffEvent";
import { getEventWorkers } from "./endpoints/events/[eventId]/workers";
import { getAssignedCategories } from "./endpoints/events/categories";
import { endEvent } from "./endpoints/events/[eventId]/endEvent";
import { getOnMap } from "./endpoints/events/onMap";
import { eventUpdateAttendance } from "./endpoints/events/[eventId]/updateAttendance";
import { ThrowNotFound } from "./errorResponses/notFound404";
import { getLiveEventData } from "./endpoints/events/[eventId]/live";
import { getEventReporting } from "./endpoints/events/[eventId]/reporting";
import { deleteAccount } from "./endpoints/user/deleteAccount";
import { searchPlaces } from "./endpoints/searchplaces";
import expressWs from "express-ws";
import { EventConnections } from "../@types/websockets";
import { publishAnnouncement } from "./endpoints/events/[eventId]/publishAnnouncement";
import { websocketHandler } from "./websocketHandler";
import multer from "multer";
import { ThrowBadRequest } from "./errorResponses/badRequest400";

const prisma = new PrismaClient();

const verifyTokenMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract the token from the Bearer scheme
    if (!token) {
        return res
            .status(403)
            .json({ message: "No token provided.", code: "" });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET as string,
        async (err, decoded) => {
            if (err) {
                ThrowUnauthorized(res);
                return;
            }

            req.user = decoded;
            const user = await prisma.user.findMany({
                where: {
                    id: (decoded as UserDecodedData).id
                },
                select: {
                    id: true,
                    type: true
                }
            });

            if (
                user.length !== 1 ||
                (decoded as UserDecodedData).role !== user[0].type
            ) {
                return ThrowUnauthorized(res);
            }
            next();
        }
    );
};

const runServer = () => {
    const PORT = process.env.PORT as string | 3000;
    const swaggerDocument = require("./swagger.json");

    const expressServer = express();
    const wsServer = expressWs(expressServer);
    const app = wsServer.app;
    const eventConnections: EventConnections = {};

    app.use(json());
    app.use(cors());
    app.use("/user", verifyTokenMiddleware);
    app.use("/events", verifyTokenMiddleware);

    app.use("/openapi", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use(morgan("dev"));

    app.get("/", async (req, res) => {
        res.json({ response: "Hello World!" });
    });

    app.get("/openapi", swaggerUi.setup(swaggerDocument));

    app.post("/login", login);
    app.post("/createAccount", createAccount);

    app.get("/searchPlaces", searchPlaces);

    app.get("/user/", getUser);
    app.put("/user/editAccount", editAccount);
    app.get("/user/verifyToken", verifyToken);
    app.delete("/user", deleteAccount);

    app.get("/events", getEvents);
    app.get("/events/latest", getLatestEvents);
    app.get("/events/nearby", getNearbyEvents);
    app.get("/events/active", getActiveEvent);
    app.get("/events/my", getMyEvents);
    app.get("/events/categories", getAssignedCategories);
    app.get("/events/onMap", getOnMap);
    const upload = multer({
        limits: { fileSize: 5 * 1024 * 1024 } // Limit set to 2MB
    }).single("image");

    // Route to handle file upload
    app.post(
        "/events/uploadImage",
        (req, res, next) => {
            upload(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === "LIMIT_FILE_SIZE") {
                        return res.status(413).json({
                            error: "File too large"
                        });
                    }
                } else if (err) {
                    return ThrowBadRequest(res);
                }
                next();
            });
        },
        uploadEventImage
    );

    app.post("/events/create", createEvent);

    app.get("/events/:eventId", getEventDetail);
    app.delete("/events/:eventId", softDelEvent);
    app.put("/events/:eventId/update", updateEvent);
    app.get("/events/:eventId/workers", getEventWorkers);

    app.put("/events/:eventId/startEvent", startEvent);
    app.post("/events/:eventId/endEvent", endEvent);

    app.get("/events/:eventId/attendance", eventWorkersAttendance);
    app.put("/events/:eventId/updateAttendance", eventUpdateAttendance);
    app.post("/events/:eventId/signFor", signForEvent);
    app.post("/events/:eventId/signOff", signOffEvent);
    app.get("/events/:eventId/live", getLiveEventData);
    app.get("/events/:eventId/reporting", getEventReporting);
    app.post("/events/:eventId/publishAnnouncement", (req, res) => {
        console.log("WebSocket connection attempted.");
        publishAnnouncement(req, res, eventConnections);
    });

    app.ws("/events/:eventId/announcements/subscribe", (ws, req) => {
        websocketHandler(ws, req, eventConnections);
    });

    app.use((req, res, next) => {
        return ThrowNotFound(res);
    });

    app.listen(PORT, () => {
        console.log(`App listening on  http://localhost:${PORT}`);
    });
};

runServer();
