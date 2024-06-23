import 'dotenv/config';
import morgan from 'morgan';

import express from "express";
const app = express();
const port = 3001;
app.use(express.json());

// CORS
import cors from "cors";
app.use(cors({
  origin: ['http://localhost:3000',], // Replace with your frontend domain
  credentials: true, // Enable cookies and HTTP authentication
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan("dev"));

import cookieParser from "cookie-parser";
app.use(cookieParser());

/*
// parse form
  //req.fields contains non-file fields 
  //req.files contains files 
import formidableMiddleware from 'express-formidable';
app.use(formidableMiddleware());
*/

// auth
import { router as authRouter } from "./Controllers/auth.mjs";
app.use("/", authRouter);

// Admin role api
import { router as adminApiRouter } from "./Controllers/adminApi.mjs";
app.use("/admin/", adminApiRouter);

// Channels routes
import { router as channelsRouter } from "./Controllers/channels.mjs";
app.use("/", channelsRouter);

// Events routes
import { router as eventsRouter } from "./Controllers/events.mjs";
app.use("/", eventsRouter);

// AccessDocuments routes
import { router as accessDocumentsRouter } from "./Controllers/accessDocuments.mjs";
app.use("/", accessDocumentsRouter);



const server = app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

// Handling Error
process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`)
  server.close(() => process.exit(1))
})