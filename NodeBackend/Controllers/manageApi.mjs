// get database
import { dbHandler } from "../db/DatabaseHandler.mjs";

// get models
import { Channel, ChannelEvent } from "../models/models.mjs";
import { ResponseChannel, ResponseChannelEvent } from "../ApiClient/responseModels.mjs";

// get auth
import { verifyToken, notAuthorizedError } from "./auth.mjs";
// get pages
import { createChannelHtml, createChannelEventHtml } from "../HTMLPages/html_pages.mjs";

import express from "express";
const router = express.Router();

/*
[!] This controller is designed to be accessed by
    the application's administration panel.
*/

// ------------ get channel events ------------>
router.route('/channel/events').get( (req, res, next) => res.send('provide channel_id'));
router.route('/channel/events/:channel_id').get( verifyToken, async (req, res, next) => {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});

    // check if the user is member and admin of requested channel
    var isAdmin = channel.admins.includes(auth._id);
    var isMember = channel.members.includes(auth._id);
    if (!isAdmin || !isMember)
        return res.status(401).json({ message: `You need to be admin of the channel` });

    // get events
    var events = await dbHandler.get_events_by_channel_id(channel_id, 10);
    if (!events) 
        return res.status(404).json({ error: `No event found with id ${channel_id}`});

    // transform the events to a ResponseModel
    var resEvents = events.map(ev => new ResponseChannelEvent(ev));

    res.status(200).send(resEvents);
});

// ------------ create new channel ------------>
const createNewChannel = async (req, res, next) => {
    var { title, isPublic } = req.fields;
    var auth = req.auth;

    // map "on" to true
    isPublic = isPublic == "on" || isPublic == "true";

    // create a class object
    var newChannel = new Channel({
        creation_date: new Date().toISOString(),
        title: title, 
        isPublic: isPublic,

        admins: [auth._id]
    });

    // add the new channel in db
    var channel = await dbHandler.create_new_channel(newChannel);
    if (!channel.isValid()) 
        return res.status(400).json({ message: `Cannot create the channel` });

    await dbHandler.subscribe_user_to_channel(auth._id.toString(), channel._id.toString());

    // transform the channel to a ResponseModel
    var resChannel = new ResponseChannel(channel);

    res.status(200).send(resChannel);
};
router.route('/create/channel').get( (req, res, next) => res.send(createChannelHtml));
router.route('/create/channel').post( verifyToken, createNewChannel);


// ------------ edit channel ------------>
const editChannel = async (req, res, next) => {
    var { channel_id, title } = req.fields;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});
    
    // check if the user is member and admin of requested channel
    var isAdmin = channel.admins.includes(auth._id);
    var isMember = channel.members.includes(auth._id);
    if (!isAdmin || !isMember)
        return res.status(401).json({ message: `You need to be admin of the channel` });
        

    return res.status(404).json({ message: `Route is in construction...` });
};
router.route('/edit/channel').get( (req, res, next) => res.send('create channel'));
router.route('/edit/channel').put( verifyToken, editChannel);

// ------------ delete channel ------------>
export const deleteChannel = async (req, res, next) => {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ message: `No channel found with id ${channel_id}` });

    // check if the user is member and admin of requested channel
    var isAdmin = channel.admins.includes(auth._id);
    var isMember = channel.members.includes(auth._id);
    if (!isAdmin || !isMember)
        return res.status(401).json({ message: `You need to be admin of the channel` });
    
    // TODO: dont delete, mark a property as deleted

    var deleted = await dbHandler.delete_channel(channel_id);

    res.status(200).send(deleted);
};
router.route('/delete/channel').get( (req, res, next) => res.send('delete channel'));
router.route('/delete/channel/:channel_id').delete( verifyToken, deleteChannel);



// ------------ create new event ------------>
const createNewEvent = async (req, res, next) => {
    var { title, channel_id } = req.fields;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ message: `No channel found with id ${channel_id}` });
    
    // check if the user is member and admin of requested channel
    var isAdmin = channel.admins.includes(auth._id);
    var isMember = channel.members.includes(auth._id);
    if (!isAdmin || !isMember)
        return res.status(401).json({ message: `You need to be admin of the channel` });
    
    // create a class object
    var newEvent = new ChannelEvent({
        creation_date: new Date().toISOString(),
        
        title: title, 
        channel_id: channel_id,
        status: "pending"
    });

    // add the new channel in db
    var event = await dbHandler.create_new_event(newEvent);
    if (!event.isValid()) 
        return res.status(400).json({ message: `Cannot create the event` });

    // transform the event to a ResponseModel
    var resEvent = new ResponseChannelEvent(event);

    res.status(200).send(resEvent);
};
router.route('/create/event').get( (req, res, next) => res.send(createChannelEventHtml));
router.route('/create/event').post( verifyToken, createNewEvent);


// ------------ delete event ------------>
export const deleteEvent = async (req, res, next) => {
    var { event_id } = req.params;
    var auth = req.auth;

    // get event
    var event = await dbHandler.get_event_by_id(event_id);
    if (!event.isValid()) 
        return res.status(404).json({ message: `No event found with id ${event_id}` });

    // get channel
    var channel = await dbHandler.get_channel_by_id(event.channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ message: `No channel found with id ${event.channel_id}` });


    // check if the user is member and admin of requested channel
    var isAdmin = channel.admins.includes(auth._id);
    var isMember = channel.members.includes(auth._id);
    if (!isAdmin || !isMember)
        return res.status(401).json({ message: `You need to be admin of the channel` });
    
    // TODO: dont delete, mark a property as deleted

    var deleted = await dbHandler.delete_event(event_id);

    res.status(200).send(deleted);
};
router.route('/delete/event').get( (req, res, next) => res.send('delete channel'));
router.route('/delete/event/:event_id').delete( verifyToken, deleteEvent);

export { router  }