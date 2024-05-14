// get database
import { dbHandler } from "./db/DatabaseHandler.mjs";
// get auth
import { verifyToken, compareUserAuth, notAuthorizedError } from "./auth.mjs";

import express from "express";
const apiRouter = express.Router();


// ------------ channel search ------------>
apiRouter.route('/channel/search').get((req, res, next) => res.send('provide channel_tittle'));
apiRouter.route('/channel/search/:channel_tittle').get( async (req, res) => {
    var { channel_tittle } = req.params;

    var c = await dbHandler.get_public_channels_by_tittle(channel_tittle);
    if (c) {
        res.send(c);
        return;
    }

    res.send(`No channels found with id ${channel_tittle}`);
});


// ------------ get channel by id ------------>
// [!] if channel is private -> This need auth security
apiRouter.route('/channel').get( (req, res, next) => {
    res.send('provide channel_id');
});
apiRouter.route('/channel/:channel_id').get( async (req, res, next) => {
    var { channel_id } = req.params;

    var c = await dbHandler.get_channel_by_id(channel_id);
    if (c.isValid()) {
        res.send(c);
        return;
    } 

    res.send(`No channel found with id ${channel_id}`);
});


// ------------ get event by id ------------>
// [!] if event is from a private channel -> This needs authentication security
apiRouter.route('/event').get( (req, res, next) => {
    res.send('provide event_id');
});
apiRouter.route('/event/:event_id').get( async (req, res, next) => {
    var { event_id } = req.params;

    var e = await dbHandler.get_event_by_id(event_id);
    if (e.isValid()) {
        res.send(e);
        return;
    } 

    res.send(`No event found with id ${event_id}`);
});


// ------------ get channel events ------------>
// [!] if channel is private -> This need auth security
apiRouter.route('/channel_events').get( (req, res, next) => {
    res.send('provide channel_id');
});
apiRouter.route('/channel_events/:channel_id').get( async (req, res, next) => {
    var { channel_id } = req.params;

    var e = await dbHandler.get_events_by_channel_id(channel_id, 10);
    if (e) {
        res.send(e);
        return;
    } 

    res.send(`No channel found with id ${channel_id}`);
});


// ------------ get logged user channels ------------>
apiRouter.route('/user_channels').get( verifyToken, async (req, res, next) => {
    var auth = req.auth;

    var c = await dbHandler.get_channels_by_user_id(auth._id);
    if (c) {
        res.send(c);
        return;
    } 

    res.send(`No user found with id ${user_id}`);
});

export { apiRouter }