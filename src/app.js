/* isme sabse pahla kaam karenge express ko import kar lenge usse hum "app." wali chize use kar paayenge
phir hum basic configurations ko set kar denge jaise (size limit of json , urlencoded aur static)
phir jo ek bala hai "CORS" wali uske liye configuration likh denge jaise (origin set kar denge, 
credentials, methods active karenge jasise GET ,POST etc. aur allowed headers ko list kar denge ) 
dekho ek chix aur hoti hai yaha jaise yaha pe parent url set hota hai jaise auth ka hua hai "/api/v1/auth" 
aur ab iske aage jisse v aana hoga o '/' lga ke aa jaayega iss liye o routes me chala jaayega*/



import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//basic Configuration [Use keyword is used for middleware ]

app.use(express.json({ limit: "16kb" })); // So that backend can take input of json file;
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // so that backend can take input from url
app.use(express.static("public")); // so that we can handle some of the static files like public which contains images

app.use(cookieParser()); //Cookie parser is the method used to access cookies
// Cors configuration

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173", // It will specifiy the origin to browser that are allowed.
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// import Healthcheck Api;

import healthCheckrouter from "./routes/healthcheck.routes.js";
app.use("/api/v1/healthcheck", healthCheckrouter);

import authRouter from "./routes/register.routes.js";
app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.send("This the new main page with separate express code");
});

app.get("/instagram", (req, res) => {
  res.send("This is new instagram page");
});

export default app;