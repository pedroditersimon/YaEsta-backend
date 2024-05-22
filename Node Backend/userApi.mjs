// get database
import { dbHandler, Channel, ChannelEvent } from "./db/DatabaseHandler.mjs";
// get auth
import { verifyToken, notAuthorizedError } from "./auth.mjs";

import express from "express";
const userApiRouter = express.Router();

// TODO: remove and hide internal information from response objects (Channels, Events)


// ------------ public channel search ------------>
userApiRouter.route('/channel/search').get((req, res, next) => res.send('provide channel_tittle'));
userApiRouter.route('/channel/search/:channel_tittle').get( verifyToken, async (req, res) => {
    var { channel_tittle } = req.params;

    // get public channels
    var channels = await dbHandler.get_public_channels_by_tittle(channel_tittle);
    if (!channels)
        return res.send(`No channels found with id ${channel_tittle}`);

    res.send(channels);
});


// ------------ get channel by id ------------>
userApiRouter.route('/channel').get( (req, res, next) => res.send('provide channel_id'));
userApiRouter.route('/channel/:channel_id').get( verifyToken, async (req, res, next) => {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.send(`No channel found with id ${channel_id}`);

    // [!] if channel is private -> needs authentication security
    if (!channel.isPublic)
    {
        // check if the user is a member of requested channel
        var isMember = channel.members.includes(auth._id);
        if (!isMember)
            return notAuthorizedError(res);
    }

    res.send(channel);
});


// ------------ get event by id ------------>
userApiRouter.route('/event').get( (req, res, next) => res.send('provide event_id'));
userApiRouter.route('/event/:event_id').get( verifyToken, async (req, res, next) => {
    var { event_id } = req.params;
    var auth = req.auth;

    // get event
    var event = await dbHandler.get_event_by_id(event_id);
    if (!event.isValid()) 
        return res.send(`No event found with id ${event_id}`);

    // get channel from event
    var channel = await dbHandler.get_channel_by_id(event.channel_id);
    if (!channel.isValid()) 
        return res.send(`No channel found with id ${event.channel_id}`);
    
    // [!] event is from a private channel -> needs authentication security
    if (!channel.isPublic)
    {
        // check if the user is a member of requested channel
        var isMember = channel.members.includes(auth._id);
        if (!isMember)
            return notAuthorizedError(res);
    }

    res.send(event);
});


// ------------ get channel events ------------>
userApiRouter.route('/channel_events').get( (req, res, next) => res.send('provide channel_id'));
userApiRouter.route('/channel_events/:channel_id').get( verifyToken, async (req, res, next) => {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.send(`No channel found with id ${channel_id}`);

    // [!] if channel is private -> needs authentication security
    if (!channel.isPublic)
    {
        // check if the user is a member of requested channel
        var isMember = channel.members.includes(auth._id);
        if (!isMember)
            return notAuthorizedError(res);
    }

    // get events
    var events = await dbHandler.get_events_by_channel_id(channel_id, 10);
    if (!events) 
        return res.send(`No channel found with id ${channel_id}`);

    res.send(events);
});


// ------------ get logged user channels ------------>
userApiRouter.route('/user_channels').get( verifyToken, async (req, res, next) => {
    var auth = req.auth;

    // get channels
    var channels = await dbHandler.get_channels_by_user_id(auth._id);
    if (!channels) 
        return res.send(`No user found with id ${user_id}`);

    res.send(channels);
});

export { userApiRouter }