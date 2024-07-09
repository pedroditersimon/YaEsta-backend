// get database
import { dbHandler } from "../DB/DatabaseHandler.mjs";
// get auth
import { warningRoute, verifyToken, compareUserAuth, notAuthorizedError } from "./auth.mjs";

import express from "express";
const router = express.Router();

// TODO: Create roles in users with USER and ADMIN
// TODO: Create a USER and ADMIN auth validators
// TODO: Create admin endpoints


/*
[!] This controller is designed so that only administrators
    of the development team can access it.
*/

// ------------ delete channel ------------>
const deleteChannel = async (req, res, next) => {
    var { channel_id } = req.params;
    var auth = req.auth;

    // TODO: check if auth is admin level
    
    // TODO: dont delete, mark a property as deleted

    var deleted = await dbHandler.delete_channel(channel_id);

    res.status(200).send(deleted);
};
router.route('/delete/channel/:channel_id').delete( verifyToken, warningRoute, deleteChannel);

export { router }