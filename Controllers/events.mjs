// get database
import { dbHandler } from "../DB/DatabaseHandler.mjs";

// get models
import { Channel, ChannelEvent, isValidID } from "../models/models.mjs";
import { ResponseChannel, ResponseChannelEvent } from "../ApiClient/responseModels.mjs";

// get auth
import { verifyToken, notAuthorizedError } from "./auth.mjs";

import { checkAdminAndMemberChannel, checkMemberChannel, checkAdminChannel } from "../Utils/utils.mjs";

import express from "express";
const router = express.Router();

// ------------ get channel events ------------>
router.route('/events/channel/:channel_id').get( verifyToken, getEventsByChannelID);
export async function getEventsByChannelID(req, res, next) {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});

    // check if the user is member and admin of requested channel
    var isAdminAndMember = await checkAdminAndMemberChannel(auth._id, channel);
    if (!isAdminAndMember)
        return res.status(401).json({ message: `You need to be admin of the channel` });

    // get events
    var events = await dbHandler.get_events_by_channel_id(channel_id, 10);
    if (!events) 
        return res.status(404).json({ error: `No event found with id ${channel_id}`});

    // transform the events to a ResponseModel
    var resEvents = events.map(ev => new ResponseChannelEvent(ev));

    res.status(200).send(resEvents);
};

// ------------ get event by id ------------>
router.route('/events/:event_id').get( verifyToken, getEventById);
export async function getEventById(req, res, next) {
    var { event_id } = req.params;
    var auth = req.auth;

    // get event
    var event = await dbHandler.get_event_by_id(event_id);
    if (!event.isValid()) 
        return res.status(404).json({ error: `No event found with id ${event_id}`});

    // get channel from event
    var channel = await dbHandler.get_channel_by_id(event.channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ error: `No channel found with id ${event.channel_id}`});

    // check if the user is admin and member of requested channel
    var isAdminAndMember = await checkAdminAndMemberChannel(auth._id, channel);
    if (!isAdminAndMember)
        return notAuthorizedError(res);

    // transform the event to a ResponseModel
    var resEvent = new ResponseChannelEvent(event);

    res.status(200).send(resEvent);
};

// ------------ get completed events of a channel ------------>
router.route('/events/completed/channel/:channel_id').get( verifyToken, getCompletedEventsByChannelID);
export async function getCompletedEventsByChannelID(req, res, next) {
    var { channel_id } = req.params;
    var auth = req.auth;

    // check if the user is a member of requested channel
    var isMember = await checkMemberChannel(auth._id, channel_id);
    if (!isMember)
        return notAuthorizedError(res);

    // get events
    var events = await dbHandler.get_completed_events_by_channel_id(channel_id, 10);
    if (!events) 
        return res.status(404).json({ error: `No event found with the channel id ${channel_id}`});

    // transform the events to a ResponseModel
    var resEvents = events.map(ev => new ResponseChannelEvent(ev));

    res.status(200).send(resEvents);
};

// ------------ create new event ------------>
router.route('/events/create').post( verifyToken, createNewEvent);
export async function createNewEvent (req, res, next) {
    var auth = req.auth;

    var receivedObj = req.body.event;
    // check received obj
    if (receivedObj === undefined) 
        return res.status(400).json({ message: `Invalid event object` });

    // get channel
    var channel = await dbHandler.get_channel_by_id(receivedObj.channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ message: `No channel found with id ${receivedObj.channel_id}` });

    // check if the user is member and admin of requested channel
    var isAdminAndMember = await checkAdminAndMemberChannel(auth._id, channel);
    if (!isAdminAndMember)
        return res.status(401).json({ message: `You need to be admin of the channel` });

   // prevent set this values:
    // delete receivedObj.prop;

    // create a Event object to insert
    var documentToInsert = new ChannelEvent(receivedObj);

    // configure fields
    documentToInsert.creation_date = new Date().toISOString();
    documentToInsert.status = "pending";
    documentToInsert.reminder_status = "pending";

    // add the new event in db
    var event = await dbHandler.create_new_event(documentToInsert);
    if (!event.isValid()) 
        return res.status(409).json({ message: `Cannot create the event` });

    // transform the event to a ResponseModel
    var resEvent = new ResponseChannelEvent(event);
    res.status(200).send(resEvent);
};

// ------------ edit event ------------>
router.route('/events/edit').put( verifyToken, editEvent);
export async function editEvent(req, res, next) {
    var auth = req.auth;

    var receivedObj = req.body.event;
    if (!isValidID(receivedObj._id))
        return res.status(400).json({ error: `Invalid id`});

    // get existing event
    var existingEvent = await dbHandler.get_event_by_id(receivedObj._id);
    if (!existingEvent.isValid()) 
        return res.status(404).json({ error: `No event found with id ${receivedObj._id}`});

    // check if the user is member and admin of requested channel
    if (existingEvent.status === "completed")
        return res.status(400).json({ message: `Cannot edit a completed event` });

    // check if the user is member and admin of requested channel
    var isAdminAndMember = await checkAdminAndMemberChannel(auth._id, existingEvent.channel_id);
    if (!isAdminAndMember)
        return res.status(401).json({ message: `You need to be admin of the channel` });

    // create a Channel object to insert by copying the existing one
    var documentToInsert = new ChannelEvent(existingEvent);
    // set given properties
    documentToInsert.updateProperties(receivedObj);
    documentToInsert._id = existingEvent._id;

    // prevent update this values:
    delete documentToInsert.channel_id;
    delete documentToInsert.creation_date;
    delete documentToInsert.status;
    delete documentToInsert.reminder_status;

    // action date changed
    if (documentToInsert.action_date !== existingEvent.action_date) {
        // reset status to re-schedule it
        documentToInsert.status = "pending";
    }

    // reminder date changed (only if uncompleted)
    if (existingEvent.reminder_status !== "completed"
        && documentToInsert.reminder_date !== existingEvent.reminder_date) {
        // reset status to re-schedule it
        documentToInsert.reminder_status = "pending";
    }

    //documentToInsert.removeCalculatedProps();

    var updated = await dbHandler.update_event(documentToInsert);
    res.status(200).send(updated);
};

// ------------ delete event ------------>
router.route('/events/delete/:event_id').delete( verifyToken, deleteEvent);
export async function deleteEvent(req, res, next) {
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
    var isAdminAndMember = await checkAdminAndMemberChannel(auth._id, channel);
    if (!isAdminAndMember)
        return res.status(401).json({ message: `You need to be admin of the channel` });
    
    // TODO: dont delete, mark a property as deleted

    var deleted = await dbHandler.delete_event(event_id);
    res.status(200).send(deleted);
};

export { router }