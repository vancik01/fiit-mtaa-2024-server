import express, { NextFunction, Request, Response, json } from "express";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import "dotenv/config";
import { AccountType, PrismaClient } from "@prisma/client";
import md5 from "md5";
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
import { createEvent } from "./endpoints/events/create";
import { updateEvent } from "./endpoints/events/[eventId]/update";
import { getNearbyEvents } from "./endpoints/events/nearby";
import { startEvent } from "./endpoints/events/[eventId]/startEvent";
import { eventWorkersAttendance } from "./endpoints/events/attendance";

const prisma = new PrismaClient();

const verifyTokenMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract the token from the Bearer scheme
    console.log("token", token);
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
    const app = express();

    app.use(json());
    app.use("/user", verifyTokenMiddleware);
    app.use(morgan("dev"));

    app.use("/events", verifyTokenMiddleware);

    app.get("/hello", async (req, res) => {
        const v = await prisma.$queryRawUnsafe("select version();");
        res.json({ response: v });
    });

    app.post("/login", login);
    app.post("/createAccount", createAccount);

    app.get("/user/", getUser);
    app.put("/user/editAccount", editAccount);
    app.get("/user/verifyToken", verifyToken);

    app.get("/events", getEvents);
    app.get("/events/latest", getLatestEvents);
    app.get("/events/nearby", getNearbyEvents);
    app.get("/events/active", getActiveEvent);
    app.get("/events/:eventId", getEventDetail);

    app.post("/events/create", createEvent);
    app.put("/events/:eventId/update", updateEvent);
    app.put("/events/:eventId/startEvent", startEvent);

    app.get("/events/:eventId/attendance", eventWorkersAttendance);

    app.listen(PORT, () => {
        console.log(`App listening on  http://localhost:${PORT}`);
        console.log("port", process.env.PORT);
    });
};

// const pointA: Coordinates = { lat: 49.0022976, lon: 18.1394956 };
// const results = await distanceQuery(pointA, 2000);
// console.log(results);

runServer();
