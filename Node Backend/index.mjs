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
import { authRouter } from "./auth.mjs";
app.use(authRouter);

// Admin role api
//import { adminApiRouter } from "./adminApi.mjs";
//app.use("/admin", userApiRouter);

// User role api
import { userApiRouter } from "./userApi.mjs";
app.use("/", userApiRouter);



const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Handling Error
process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`)
  server.close(() => process.exit(1))
})