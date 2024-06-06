// get database
import { dbHandler } from "./db/DatabaseHandler.mjs";
// get auth
import { verifyToken, compareUserAuth, notAuthorizedError } from "./auth.mjs";

import express from "express";
const router = express.Router();

// TODO: Create roles in users with USER and ADMIN
// TODO: Create a USER and ADMIN auth validators
// TODO: Create admin endpoints

// ------------ edit channel ------------>
const deleteChannel = async (req, res, next) => {
    var { channel_id } = req.params;
    var auth = req.auth;

    // TODO: check if auth is admin level

    // TODO: dont delete, mark a property as deleted

    var deleted = await dbHandler.delete_channel(channel_id);

    res.send(deleted);
};
router.route('/delete/channel').get( (req, res, next) => res.send('delete channel'));
router.route('/delete/channel/:channel_id').get( verifyToken, deleteChannel);

export { router }