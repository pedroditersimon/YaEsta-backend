// get database
import { dbHandler } from "./db/DatabaseHandler.mjs";

// get models
import { Channel, ChannelEvent } from "./models/models.mjs";
import { ResponseChannel, ResponseChannelEvent } from "./ApiClient/responseModels.mjs";

// get auth
import { verifyToken, notAuthorizedError } from "./auth.mjs";
// get pages
import { createChannelHtml, createChannelEventHtml } from "./HTMLPages/html_pages.mjs";

import express from "express";
const router = express.Router();


// ------------ create new channel ------------>
const createNewChannel = async (req, res, next) => {
    var { title, isPublic } = req.fields;
    var auth = req.auth;

    // map "on" to true
    isPublic = isPublic == "on" || isPublic == "true";

    // create a class object
    var newChannel = new Channel({
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
router.route('/create/channel').put( verifyToken, createNewChannel);


// ------------ edit channel ------------>
const editChannel = async (req, res, next) => {
    var { channel_id, title } = req.fields;
    var auth = req.auth;

    return res.status(404).json({ message: `Route is in construction...` });
};
router.route('/edit/channel').get( (req, res, next) => res.send('create channel'));
router.route('/edit/channel').post( verifyToken, editChannel);

// ------------ delete channel ------------>
export const deleteChannel = async (req, res, next) => {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ message: `No channel found with id ${channel_id}` });

    // check if the user is a admin of requested channel
    var isAdmin = channel.admins.includes(auth._id);
    if (!isAdmin)
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
    
    // check if the user is a admin of requested channel
    var isAdmin = channel.admins.includes(auth._id);
    if (!isAdmin)
        return res.status(401).json({ message: `You need to be admin of the channel` });
    
    // create a class object
    var newEvent = new ChannelEvent({
        title: title, 
        channel_id: channel_id
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
router.route('/create/event').put( verifyToken, createNewEvent);


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


    // check if the user is a admin of requested channel
    var isAdmin = channel.admins.includes(auth._id);
    if (!isAdmin)
        return res.status(401).json({ message: `You need to be admin of the channel` });
    
    // TODO: dont delete, mark a property as deleted

    var deleted = await dbHandler.delete_event(event_id);

    res.status(200).send(deleted);
};
router.route('/delete/event').get( (req, res, next) => res.send('delete channel'));
router.route('/delete/event/:event_id').delete( verifyToken, deleteEvent);

export { router  }