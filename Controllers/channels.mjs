// get database
import { dbHandler} from "../db/DatabaseHandler.mjs";

// get models
import {Channel, ChannelEvent, isValidID } from "../models/models.mjs";
import { ResponseChannel, ResponseChannelEvent } from "../ApiClient/responseModels.mjs";

// get auth
import { verifyToken, notAuthorizedError } from "./auth.mjs";

import { checkAdminAndMemberChannel, checkMemberChannel, checkAdminChannel } from "../Utils/utils.mjs";

import express from "express";
const router = express.Router();

// ------------ public channel search ------------>
router.route('/channels/search/:channel_title').get( verifyToken, getPublicChannels);
export async function getPublicChannels(req, res, next) {
    var { channel_title } = req.params;

    // get public channels
    var channels = await dbHandler.get_public_channels_by_title(channel_title);
    if (!channels)
        return res.status(404).json({ message: `No channels found with title ${channel_title}` });
    
    // transform the channels to a ResponseModel
    var resChannels = channels.map(c => new ResponseChannel(c));

    res.status(200).send(resChannels);
}

// ------------ get logged user channels ------------>
router.route('/channels/user').get( verifyToken, getUserChannels);
export async function getUserChannels(req, res, next) {
    var auth = req.auth;

    // get channels
    var channels = await dbHandler.get_channels_by_user_id(auth._id);
    if (!channels) 
        return res.status(404).json({error:`No user found with id ${auth._id}`});

    // transform the channels to a ResponseModel
    var resChannels = channels.map(c => new ResponseChannel(c));

    res.status(200).send(resChannels);
}

// ------------ get channel by id ------------>
router.route('/channels/:channel_id').get( verifyToken, getChannelById);
export async function getChannelById(req, res, next) {
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
        var isMember = await checkMemberChannel(auth._id, channel);
        if (!isMember)
            return notAuthorizedError(res);
    }

    // transform the channel to a ResponseModel
    var resChannel = new ResponseChannel(channel);

    res.status(200).send(resChannel);
}


// ------------ create new channel ------------>
router.route('/channels/create').post( verifyToken, createNewChannel);
export async function createNewChannel(req, res, next) {
    var auth = req.auth;

    var receivedObj = req.body.channel;
    // check received obj
    if (receivedObj === undefined) 
        return res.status(400).json({ message: `Invalid channel object` });

    // prevent set this values:
    delete receivedObj.members;

    // create an Channel object to insert
    var documentToInsert = new Channel(receivedObj);

    // configure fields
    documentToInsert.creation_date = new Date().toISOString();
    documentToInsert.isPublic = receivedObj.isPublic === true || receivedObj.isPublic === "on" || receivedObj.isPublic == "true";
    documentToInsert.admins = [auth._id];

    // add the new channel in db
    var channel = await dbHandler.create_new_channel(documentToInsert);
    if (!channel.isValid()) 
        return res.status(400).json({ message: `Cannot create the channel` });

    await dbHandler.subscribe_user_to_channel(auth._id.toString(), channel._id.toString());

    // transform the channel to a ResponseModel
    var resChannel = new ResponseChannel(channel);
    res.status(200).send(resChannel);
};

// ------------ edit channel ------------>
router.route('/channels/edit').put( verifyToken, editChannel);
export async function editChannel(req, res, next) {
    var auth = req.auth;

    var receivedObj = req.body.channel;
    // check received obj
    if (receivedObj === undefined) 
        return res.status(400).json({ message: `Invalid channel object` });

    if (!isValidID(receivedObj._id))
        return res.status(400).json({ error: `Invalid id`});

    // get existing channel
    var existingChannel = await dbHandler.get_channel_by_id(receivedObj._id);
    if (!existingChannel.isValid()) 
        return res.status(404).json({ error: `No channel found with id ${receivedObj._id}`});

    // check if the user is member and admin of requested channel
    var isAdminAndMember = await checkAdminAndMemberChannel(auth._id, existingChannel);
    if (!isAdminAndMember)
        return res.status(401).json({ message: `You need to be admin of the channel` });

    // create a Channel object to insert by copying the existing one
    var documentToInsert = new Channel(existingChannel);
    // set given properties
    documentToInsert.updateProperties(receivedObj);
    documentToInsert._id = existingChannel._id;

    // prevent update this values:
    delete documentToInsert.creation_date;
    delete documentToInsert.members;
    delete documentToInsert.admins;

    documentToInsert.removeCalculatedProps();

    var updated = await dbHandler.update_channel(documentToInsert);
    res.status(200).send(updated);
};

// ------------ delete channel ------------>
router.route('/channels/delete/:channel_id').delete( verifyToken, deleteChannel);
export async function deleteChannel(req, res, next) {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ message: `No channel found with id ${channel_id}` });

    // check if the user is member and admin of requested channel
    var isAdminAndMember = await checkAdminAndMemberChannel(auth._id, channel);
    if (!isAdminAndMember)
        return res.status(401).json({ message: `You need to be admin of the channel` });
    
    // TODO: dont delete, mark a property as deleted

    var deleted = await dbHandler.delete_channel(channel_id);
    res.status(200).send(deleted);
};

// ------------ subscribe user to channel ------------>
router.route('/channels/subscribe/:channel_id').post( verifyToken, subscribeToChannel);
export async function subscribeToChannel(req, res, next) {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});

    // check if the user is already a member of requested channel
    var isMember = await checkMemberChannel(auth._id, channel);
    if (isMember)
        return res.status(409).json({ error: 'User is already a member of the channel' });

    // [!] if the channel is private, only admins can subscribe with the channel id
    if (!channel.isPublic){
        var isAdmin = await checkAdminChannel(auth._id, channel);
        if(!isAdmin)
            return notAuthorizedError(res);
    } 

    var subscribed = await dbHandler.subscribe_user_to_channel(auth._id, channel_id);
    if (!subscribed) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});

    res.status(200).send(true);
}

// ------------ unsubscribe user to channel ------------>
router.route('/channels/unsubscribe/:channel_id').post( verifyToken, unsubscribeFromChannel);
export async function unsubscribeFromChannel(req, res, next) {
    var { channel_id } = req.params;
    var auth = req.auth;

    // get channel
    var channel = await dbHandler.get_channel_by_id(channel_id);
    if (!channel.isValid()) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});

    // check if the user is a member of requested channel
    var isMember = await checkMemberChannel(auth._id, channel);
    if (!isMember)
        return res.status(409).json({ error: 'User isnt a member of the channel' });

    // TODO: Delete private channels if the last member has unsubscribed
    if (!channel.isPublic && channel.membersCount == 1) 
        return res.status(409).json({ error: 'Last member cannot unsubscribe from a private channel' });

    var unsubscribed = await dbHandler.unsubscribe_user_from_channel(auth._id, channel_id);
    if (!unsubscribed) 
        return res.status(404).json({ error: `No channel found with id ${channel_id}`});

    res.status(200).send(true);
}

export { router }