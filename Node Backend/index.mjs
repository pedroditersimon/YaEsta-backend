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

import { apiRouter } from "./api.mjs";
app.use(apiRouter);

import { authRouter } from "./auth.mjs";
app.use(authRouter);

const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Handling Error
process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`)
  server.close(() => process.exit(1))
})