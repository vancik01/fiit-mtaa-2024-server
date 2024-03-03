import express, { NextFunction, Request, Response, json } from "express";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import md5 from "md5";
import jwt from "jsonwebtoken";

const passportJWTStrategy = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET as string
    },
    (payload, done) => {
        return done(null, { userID: payload.userID });
    }
);

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

    app.get("/login", async (req, res) => {
        const { email, password } = req.body;
        const user = await prisma.user.findFirst({
            where: {
                email: email
            },
            select: {
                id: true,
                email: true,
                password: true,
                type: true
            }
        });

        if (user === null) {
            res.status(403).json({
                message: "User with email does not exist",
                status: "UNKNOWN_USER"
            });
            return;
        }

        const HASHpassword = md5(password);
        if (user.password !== HASHpassword) {
            res.status(403).json({
                message: "Password incorrect",
                status: "PASSWORD_INCORRECT"
            });
            return;
        }

        const accessToken = jwt.sign(
            {
                userID: user.id,
                role: user.type
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).send({
            accessToken,
            user: {
                email: user.email,
                accountType: user.type,
                userID: user.id
            }
        });
    });

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
