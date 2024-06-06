import 'dotenv/config';

import express from "express";
const app = express();
const port = 3000;
app.use(express.json());

import cookieParser from "cookie-parser";
app.use(cookieParser());

// parse form
  //req.fields contains non-file fields 
  //req.files contains files 
import formidableMiddleware from 'express-formidable';
app.use(formidableMiddleware());

// auth
import { router as authRouter } from "./auth.mjs";
app.use(authRouter);

// Admin role api
import { router as adminApiRouter } from "./adminApi.mjs";
app.use("/admin/", adminApiRouter);

// User role api
import { router as userApiRouter } from "./userApi.mjs";
app.use("/", userApiRouter);

// Manage api
import { router as manageApiRouter } from "./manageApi.mjs";
app.use("/", manageApiRouter);


const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Handling Error
process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`)
  server.close(() => process.exit(1))
})