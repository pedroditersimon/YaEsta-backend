import 'dotenv/config';
import morgan from 'morgan';

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// routes
import { router as authRouter } from "./Controllers/auth.mjs";
import { router as adminApiRouter } from "./Controllers/adminApi.mjs";
import { router as channelsRouter } from "./Controllers/channels.mjs";
import { router as eventsRouter } from "./Controllers/events.mjs";
import { router as accessDocumentsRouter } from "./Controllers/accessDocuments.mjs";
import { router as notificationsRouter } from "./Controllers/notifications.mjs";

import eventScheduler from "./Controllers/eventScheduler.mjs";

import { admin, fbMessaging } from './Controllers/Google/firebase-admin.mjs';

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

corsOptions = {
  origin: process.env.CORS_ORIGIN, // Replace with your frontend domain
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}

// CORS
app.use(cors(corsOptions));

// Maneja las solicitudes preflight
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(morgan("dev"));

// Routes
// auth
app.use("/", authRouter);
// Admin role api
app.use("/admin/", adminApiRouter);
// Channels routes
app.use("/", channelsRouter);
// Events routes
app.use("/", eventsRouter);
// AccessDocuments routes
app.use("/", accessDocumentsRouter);
// Notifications routes
app.use("/", notificationsRouter);

// server status
app.get("/status", async (req, res, next) => res.status(200));

// EventScheduler
// 30 seconds interval: 30 * 1000
// 30 min interval: 30 * 60 * 1000
const eventSchedulerInterval = 30 * 1000;
eventScheduler.setInvervalAndStop(eventSchedulerInterval);


const server = app.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}`);
  console.log(`Now: ${new Date().toUTCString()}`);
  
  eventScheduler.startScheduling();
});

// Handling Error
process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`)
  // server.close(() => process.exit(1))
})