import express, { NextFunction, Request, Response, json } from "express";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import "dotenv/config";
import { AccountType, PrismaClient } from "@prisma/client";
import md5 from "md5";
import jwt from "jsonwebtoken";
import { login } from "./endpoints/login";
import { createAccount } from "./endpoints/createAccount";
import { editAccount } from "./endpoints/user/editAccount";
import { UserDecodedData } from "../@types/jwtToken";
import { ThrowUnauthorized } from "./errorResponses/unauthorized401";
import { verifyToken } from "./endpoints/user/verifyToken";
import { getUser } from "./endpoints/user";

const prisma = new PrismaClient();

const verifyTokenMiddlewear = (
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

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
            ThrowUnauthorized(res);
            return;
        }
        // If the token is valid, save to request for use in other routes
        req.user = decoded as UserDecodedData;
        next();
    });
};

const runServer = () => {
    const PORT = process.env.PORT as string | 3000;
    const app = express();

    app.use(json());
    app.use("/user", verifyTokenMiddlewear);

    app.get("/hello", async (req, res) => {
        const v = await prisma.$queryRawUnsafe("select version();");
        res.json({ response: v });
    });

    app.get("/login", login);
    app.post("/createAccount", createAccount);

    app.get("/user/", getUser);
    app.put("/user/editAccount", editAccount);
    app.get("/user/verifyToken", verifyToken);

    app.listen(PORT, () => {
        console.log(`App listening on  http://localhost:${PORT}`);
        console.log("port", process.env.PORT);
    });
};

// const pointA: Coordinates = { lat: 49.0022976, lon: 18.1394956 };
// const results = await distanceQuery(pointA, 2000);
// console.log(results);

runServer();
