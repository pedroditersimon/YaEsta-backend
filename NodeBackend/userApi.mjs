// get database
import { dbHandler} from "./db/DatabaseHandler.mjs";

// get models
import {Channel, ChannelEvent } from "./models/models.mjs";
import { ResponseChannel, ResponseChannelEvent } from "./ApiClient/responseModels.mjs";

// get auth
import { verifyToken, notAuthorizedError } from "./auth.mjs";

import { deleteChannel } from "./manageApi.mjs";

import express from "express";
const router = express.Router();


// ------------ public channel search ------------>
router.route('/channel/search').get((req, res, next) => res.send('provide channel_title'));
router.route('/channel/search/:channel_title').get( /*verifyToken,*/ async (req, res) => {
    var { channel_title } = req.params;

    // get public channels
    var channels = await dbHandler.get_public_channels_by_title(channel_title);
    if (!channels)
        return res.status(404).json({ message: `No channels found with title ${channel_title}` });
    
    // transform the channels to a ResponseModel
    var resChannels = channels.map(c => new ResponseChannel(c));

    res.status(200).send(resChannels);
});


// ------------ get channel by id ------------>
router.route('/channel').get( (req, res, next) => res.send('provide channel_id'));
router.route('/channel/:channel_id').get( verifyToken, async (req, res, next) => {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});

    // [!] if channel is private -> needs authentication security
    if (!channel.isPublic)
    {
        // check if the user is a member of requested channel
        var isMember = channel.members.includes(auth._id);
        if (!isMember)
            return notAuthorizedError(res);
    }

    // transform the channel to a ResponseModel
    var resChannel = new ResponseChannel(channel);

    res.status(200).send(resChannel);
});


// ------------ get event by id ------------>
router.route('/event').get( (req, res, next) => res.send('provide event_id'));
router.route('/event/:event_id').get( verifyToken, async (req, res, next) => {
    var { event_id } = req.params;
    var auth = req.auth;

    // get event
    var event = await dbHandler.get_event_by_id(event_id);
    if (!event.isValid()) 
        return res.status(404).send(`No event found with id ${event_id}`);

    // get channel from event
    var channel = await dbHandler.get_channel_by_id(event.channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ error: `No channel found with id ${event.channel_id}`});
    
    // [!] event is from a private channel -> needs authentication security
    if (!channel.isPublic)
    {
        // check if the user is a member of requested channel
        var isMember = channel.members.includes(auth._id);
        if (!isMember)
            return notAuthorizedError(res);
    }

    // transform the event to a ResponseModel
    var resEvent = new ResponseChannelEvent(event);

    res.status(200).send(resEvent);
});


// ------------ get channel events ------------>
router.route('/channel/events').get( (req, res, next) => res.send('provide channel_id'));
router.route('/channel/events/:channel_id').get( verifyToken, async (req, res, next) => {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});

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
        return res.status(404).json({ error: `No event found with id ${channel_id}`});

    // transform the events to a ResponseModel
    var resEvents = events.map(ev => new ResponseChannelEvent(ev));

    res.status(200).send(resEvents);
});


// ------------ subscribe user to channel ------------>
router.route('/channel/subscribe').get( (req, res, next) => res.send('provide channel_id'));
router.route('/channel/subscribe/:channel_id').get( verifyToken, async (req, res, next) => {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});

    // [!] if channel is private -> needs authentication security
    if (!channel.isPublic)
    {
        // TODO: you cannot subscribe a private channel with only id
        // - implement a secret code or something
    }

    // check if the user is already a member of requested channel
    var isMember = channel.members.includes(auth._id);
    if (isMember)
        return res.status(409).json({ error: 'User is already a member of the channel' });

    var subscribed = await dbHandler.subscribe_user_to_channel(auth._id, channel_id);
    if (!subscribed) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});

    res.status(200).send(true);
});

// ------------ unsubscribe user to channel ------------>
router.route('/channel/unsubscribe').get( (req, res, next) => res.send('provide channel_id'));
router.route('/channel/unsubscribe/:channel_id').get( verifyToken, async (req, res, next) => {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});

    // check if the user is a member of requested channel
    var isMember = channel.members.includes(auth._id);
    if (!isMember)
        return res.status(409).json({ error: 'User isnt a member of the channel' });

    // Delete private channels if the last member has unsubscribed
    if (!channel.isPublic && channel.members.length <= 2)
        return deleteChannel(req, res, next);

    var unsubscribed = await dbHandler.unsubscribe_user_from_channel(auth._id, channel_id);
    if (!unsubscribed) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});

    res.status(200).send(true);
});

// ------------ get logged user channels ------------>
router.route('/user_channels').get( verifyToken, async (req, res, next) => {
    var auth = req.auth;

    // get channels
    var channels = await dbHandler.get_channels_by_user_id(auth._id);
    if (!channels) 
        return res.status(404).json({error:`No user found with id ${auth._id}`});

    // transform the channels to a ResponseModel
    var resChannels = channels.map(c => new ResponseChannel(c));

    res.status(200).send(resChannels);
});



export { router }