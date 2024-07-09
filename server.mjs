import 'dotenv/config';
import morgan from 'morgan';

import express from "express";
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

// CORS
import cors from "cors";
app.use(cors({
  origin: ['http://localhost:3000', process.env.CORS_ORIGIN], // Replace with your frontend domain
  credentials: true, // Enable cookies and HTTP authentication
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan("dev"));

import cookieParser from "cookie-parser";
app.use(cookieParser());

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

import EventScheduler from "./Controllers/eventScheduler.mjs";

// 30 min interval
//const eventSchedulerInterval = 30 * 60 * 1000;
const eventSchedulerInterval = 5 * 1000;
const eventScheduler = new EventScheduler(eventSchedulerInterval);


const server = app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
  console.log(`Now: ${new Date().toISOString()}`);
  
  eventScheduler.startScheduling();
});

// Handling Error
process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`)
  // server.close(() => process.exit(1))
})