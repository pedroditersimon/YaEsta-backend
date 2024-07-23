// get database
import { dbHandler } from "../DB/DatabaseHandler.mjs";
// get auth
import { warningRoute, verifyToken, compareUserAuth, notAuthorizedError } from "./auth.mjs";

import { AccessDocument, Channel, isValidID } from "../Models/models.mjs";
import { ResponseAccessDocument } from "../ApiClient/responseModels.mjs";

import { checkAdminAndMemberChannel, getOnlyDefinedFields } from "../Utils/utils.mjs";

import express from "express";
const router = express.Router();

/*
[!] This controller is designed to ...
*/


// ------------ get all Access Documents of a channel ------------>
router.route('/access_documents/channel/:channel_id').get( verifyToken, getAccessDocumentsByChannelID);
export async function getAccessDocumentsByChannelID(req, res, next) {
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

    var accessDocuments = await dbHandler.get_access_documents_by_channel_id(channel_id);
    if (!accessDocuments) 
        return res.status(404).json({ error: `No AccessDocument found with the channel id ${channel_id}`});

    // transform the AccessDocuments to a ResponseModel
    var resAccessDocuments = accessDocuments.map(c => new ResponseAccessDocument(c));

    res.status(200).send(resAccessDocuments);
};

// ------------ get all create access documents created by a user ------------>
router.route('/access_documents/user').get( verifyToken, getUserAccessDocuments);
export async function getUserAccessDocuments(req, res, next) {
    var { channel_id } = req.params;
    var auth = req.auth;

    var accessDocuments = await dbHandler.get_create_access_documents_by_creator_id(auth._id);
    if (!accessDocuments) 
        return res.status(404).json({ error: `No AccessDocument found with the channel id ${channel_id}`});

    // transform the AccessDocuments to a ResponseModel
    var resAccessDocuments = accessDocuments.map(c => new ResponseAccessDocument(c));

    res.status(200).send(resAccessDocuments);
};

// ------------ get Access Document ------------>
router.route('/access_documents/:access_document_id').get( verifyToken, getAccessDocument);
export async function getAccessDocument(req, res, next) {
    var { access_document_id } = req.params;
    var auth = req.auth;

    var accessDocument = await dbHandler.get_access_document_by_id(access_document_id);
    if (!accessDocument.isValid()) 
        return res.status(404).json({ error: `No AccessDocument found with id ${access_document_id}`});

    // action_type: 'create'
    if (accessDocument.action_type === "create")
    {
        // user must be the creator of the document to get it
        if (auth._id !== accessDocument.creator_user_id)
            return notAuthorizedError(res);
    }
    // action_type: 'subscribe'
    else
    {
        // check if the user is member and admin of requested channel
        var isAdminAndMember = await checkAdminAndMemberChannel(auth._id, accessDocument.target_channel_id);
        if (!isAdminAndMember)
            return res.status(401).json({ message: `You need to be admin of the channel` });
    }

    const resAccessDocument = new ResponseAccessDocument(accessDocument);

    res.status(200).send(resAccessDocument);
};


// ------------ create Access Document ------------>
router.route('/access_documents/create').post( verifyToken, createAccessDocument);
export async function createAccessDocument(req, res, next) {
    var auth = req.auth;

    var receivedObj = req.body.accessDocument;
    // prevent set this values:
    delete receivedObj.creator_user_id;
    delete receivedObj.creation_date;
    delete receivedObj.pending_approval
    delete receivedObj.created_channels;

    // create an AccessDocument object to insert
    var documentToInsert = new AccessDocument(receivedObj);

    // calculate fields
    documentToInsert.creator_user_id = auth._id;
    documentToInsert.creation_date = new Date().toUTCString();

    // if insert action_type is 'create'
    if (documentToInsert.action_type === "create")
    {
        // remove target_channel_id in 'create' documents
        documentToInsert.target_channel_id = "";
    }
    // if insert action_type is 'subscribe'
    else
    {
        // subscribe document must have a valid target channel id
        if (!isValidID(documentToInsert.target_channel_id))
            return res.status(400).json({ error: `Invalid taget channel id`});

        // check if the user is member and admin of the new target channel
        var isAdminAndMember = await checkAdminAndMemberChannel(auth._id, documentToInsert.target_channel_id);
        if (!isAdminAndMember)
            return res.status(401).json({ message: `You need to be admin of the target channel` });
    }

    var createdAccessDocument = await dbHandler.create_new_access_document(documentToInsert);
    if (!createdAccessDocument.isValid()) 
        return res.status(400).json({ message: `Cannot create the AccessDocument` });

    const resAccessDocument = new ResponseAccessDocument(createdAccessDocument);

    res.status(200).send(resAccessDocument);
};

// ------------ delete Access Document ------------>
// TODO: dont delete, mark a property as deleted
router.route('/access_documents/delete/:access_document_id').delete( verifyToken, deleteAccessDocument);
export async function deleteAccessDocument(req, res, next) {
    var { access_document_id } = req.params;
    var auth = req.auth;

    var accessDocument = await dbHandler.get_access_document_by_id(access_document_id);
    if (!accessDocument.isValid()) 
        return res.status(404).json({ error: `No AccessDocument found with id ${access_document_id}`});

    // action_type: 'create'
    if (accessDocument.action_type === "create")
    {
        // user must be the creator of the document to delete it
        if (auth._id !== accessDocument.creator_user_id)
            return notAuthorizedError(res);
    }
    // action_type: 'subscribe'
    else
    {
        // check if the user is member and admin of requested channel
        var isAdminAndMember = await checkAdminAndMemberChannel(auth._id, accessDocument.target_channel_id);
        if (!isAdminAndMember)
            return res.status(401).json({ message: `You need to be admin of the channel` });
    }
    
    var deleted = await dbHandler.delete_access_document(access_document_id);

    res.status(200).send(deleted);
};

// ------------ edit Access Document ------------>
router.route('/access_documents/edit').put( verifyToken, editAccessDocument);
export async function editAccessDocument(req, res, next) {
    var auth = req.auth;

    var givenId = req.body.accessDocument._id;
    if (!isValidID(givenId))
        return res.status(400).json({ error: `Invalid id`});

    // get existing accessDocument
    var existingAccessDocument = await dbHandler.get_access_document_by_id(givenId);
    if (!existingAccessDocument.isValid()) 
        return res.status(404).json({ error: `No AccessDocument found with id ${givenId}`});
    
    // existing action_type: 'create'
    if (existingAccessDocument.action_type === "create")
    {
        // user must be the creator of the document to edit it
        if (auth._id !== existingAccessDocument.creator_user_id)
            return notAuthorizedError(res);
    }
    // existing action_type: 'subscribe'
    else
    {
        // if existing document already has a target channel
        if (existingAccessDocument.target_channel_id)
        {
            // check if the user is member and admin to edit existing accessDocument
            var isAdminAndMember = await checkAdminAndMemberChannel(auth._id, existingAccessDocument.target_channel_id);
            if (!isAdminAndMember)
                return res.status(401).json({ message: `You need to be admin of the channel to edit that document` });
        }
    }

    // create an AccessDocument object to insert by copying the existing one
    var documentToInsert = new AccessDocument(existingAccessDocument);
    // set given properties
    documentToInsert.updateProperties(req.body.accessDocument);
    documentToInsert._id = existingAccessDocument._id;

    // prevent update this values:
    delete documentToInsert.creator_user_id;
    delete documentToInsert.creation_date;
    delete documentToInsert.pending_approval
    delete documentToInsert.created_channels;

    // if insert action_type is 'create'
    if (documentToInsert.action_type === "create")
    {
        // remove target channel in 'create' documents
        documentToInsert.target_channel_id = "";
    }
    // if insert action_type is 'subscribe'
    else
    {
        // subscribe document must have a valid target channel id
        if (!isValidID(documentToInsert.target_channel_id))
            return res.status(400).json({ error: `Invalid taget channel id`});

        // check if the user is member and admin of the new target channel
        var isAdminAndMember = await checkAdminAndMemberChannel(auth._id, documentToInsert.target_channel_id);
        if (!isAdminAndMember)
            return res.status(401).json({ message: `You need to be admin of the target channel` });
    }

    var updated = await dbHandler.update_access_document(documentToInsert);
    res.status(200).send(updated);
};


async function createChannelByAccessDocument(accessDocument) {
    // create an Channel object to insert
    var documentToInsert = new Channel();

    // configure fields
    documentToInsert.title = accessDocument.generate_title();
    documentToInsert.creation_date = new Date().toUTCString();
    documentToInsert.isPublic = false;
    documentToInsert.admins = [accessDocument.creator_user_id];

    const createdChannel = await dbHandler.create_new_channel(documentToInsert);
    if (!createdChannel.isValid())
        return new Channel();

    // register the created channel and update access document
    const create_register = { user_id: auth._id, channel_id: createdChannel._id.toString() };
    accessDocument.created_channels.push(create_register);
    await dbHandler.update_access_document(accessDocument);

    return createdChannel;
}

// ------------ trigger Access Document ------------>
router.route('/access_documents/trigger/:access_document_id').post( verifyToken, triggerAccessDocument);
export async function triggerAccessDocument(req, res, next) {
    var { access_document_id } = req.params;
    var auth = req.auth;

    // get accessDocument
    var accessDocument = await dbHandler.get_access_document_by_id(access_document_id);
    if (!accessDocument.isValid()) 
        return res.status(404).json({ error: `No AccessDocument found with id ${access_document_id}`});
    
    // acces document is disabled
    if (!accessDocument.enabled)
        return res.status(404).json({ error: `No AccessDocument found with id ${access_document_id}`});

    var channel_id_to_subscribe = "";


    // action_type: 'create'
    if (accessDocument.action_type === "create") {
        // check if user already created a channel
        const userCreatedChannelID = accessDocument.getUserCreatedChannelID();

        if (!userCreatedChannelID) {
            // create new channel
            const createdChannel = await createChannelByAccessDocument(accessDocument);
            if (!createdChannel.isValid())
                return res.status(409).json({ error: `Cannot trigger 'create' accessDocument`});

            channel_id_to_subscribe = createdChannel._id.toString();
        }
        // set to resubscribe the user to already created channel
        else {
            channel_id_to_subscribe = userCreatedChannelID;
        }
    }
    // action_type: 'subscribe'
    else {
        channel_id_to_subscribe = accessDocument.target_channel_id;
    }

    var subscribed = await dbHandler.subscribe_user_to_channel(auth._id, channel_id_to_subscribe);
    if (!subscribed) 
        return res.status(404).json({ error: `Cannot subscribe to the channel id ${channel_id_to_subscribe}`});

    res.status(200).send(subscribed);
};

export { router }