// get database
import { dbHandler } from "./db/DatabaseHandler.mjs";
// get auth
import { verifyToken, compareUserAuth, notAuthorizedError } from "./auth.mjs";

import express from "express";
const adminApiRouter = express.Router();

// TODO: Create roles in users with USER and ADMIN
// TODO: Create a USER and ADMIN auth validators
// TODO: Create admin endpoints

export { adminApiRouter }