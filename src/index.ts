import express, { NextFunction, Request, Response, json } from "express";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import md5 from "md5";
import jwt from "jsonwebtoken";
import { login } from "./endpoints/login";

const prisma = new PrismaClient();

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract the token from the Bearer scheme

    if (!token) {
        return res
            .status(403)
            .json({ message: "No token provided.", code: "" });
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
            return res
                .status(403)
                .json({ message: "Failed to authenticate token." });
        }
        // If the token is valid, save to request for use in other routes
        req.user = decoded;
        next();
    });
};

const runServer = () => {
    const PORT = process.env.PORT as string | 3000;
    const app = express();

    app.use(json());
    app.use("/user", verifyToken);

    app.get("/hello", async (req, res) => {
        const v = await prisma.$queryRawUnsafe("select version();");
        res.json({ response: v });
    });

    app.get("/login", login);

    app.get("/user/verify-token", (req, res) => {
        // If this callback gets called, the token is valid
        // req.user will be populated with the payload's data
        console.log(req.headers.authorization);
        console.log(req.user);
        res.json({ message: "Token is valid" });
    });

    app.listen(PORT, () => {
        console.log(`App listening on  http://localhost:${PORT}`);
        console.log("port", process.env.PORT);
    });
};

// const pointA: Coordinates = { lat: 49.0022976, lon: 18.1394956 };
// const results = await distanceQuery(pointA, 2000);
// console.log(results);

runServer();
