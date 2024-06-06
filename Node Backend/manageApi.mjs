// get database
import { dbHandler, Channel, ChannelEvent } from "./db/DatabaseHandler.mjs";
// get auth
import { verifyToken, notAuthorizedError } from "./auth.mjs";
// get pages
import { createChannelHtml, createChannelEventHtml } from "./html_pages/html_pages.mjs";

import express from "express";
const router = express.Router();



// ------------ Response models ------------>
// used to remove internal information from response objects, contains only necessary data
class ResponseChannel {
    _id;
    tittle = "";

    isPublic = false;

    // IDs list
    events = [];

    constructor(data=null) {
        if (data)
            this.updateProperties(data);
    }

    updateProperties(data) {
        for (let key in this) {
            if (data.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }

    isValid() {
        return this._id != undefined && this._id != null;
    }
}


// ------------ create new channel ------------>
const createNewChannel = async (req, res, next) => {
    var { tittle, isPublic } = req.fields;
    var auth = req.auth;

    // map "on" to true
    isPublic = isPublic == "on" || isPublic == "true";

    // create a class object
    var newChannel = new Channel({
        tittle: tittle, 
        isPublic: isPublic,

        admins: [auth._id]
    });

    // add the new channel in db
    var channel = await dbHandler.create_new_channel(newChannel);
    if (!channel.isValid()) 
        return res.send(`Cannot create the channel`);

    await dbHandler.subscribe_user_to_channel(auth._id.toString(), channel._id.toString());

    // transform given channel from db to ResponseChannel
    var resChannel = new ResponseChannel(channel);
    res.send(resChannel);
};
router.route('/create/channel').get( (req, res, next) => res.send(createChannelHtml));
router.route('/create/channel').post( verifyToken, createNewChannel);


// ------------ edit channel ------------>
const editChannel = async (req, res, next) => {
    var { channel_id, tittle } = req.fields;
    var auth = req.auth;

    // transform given channel from db to ResponseChannel
    var resChannel = new ResponseChannel(channel);

    res.send(resChannel);
};
router.route('/edit/channel').get( (req, res, next) => res.send('create channel'));
router.route('/edit/channel').post( verifyToken, editChannel);



// ------------ create new channel ------------>
const createNewEvent = async (req, res, next) => {
    var { tittle, channel_id } = req.fields;
    var auth = req.auth;

    // create a class object
    var newEvent = new ChannelEvent({
        tittle: tittle, 
        channel_id: channel_id
    });

    // add the new channel in db
    var event = await dbHandler.create_new_event(newEvent);
    if (!event.isValid()) 
        return res.send(`Cannot create the channel`);

    res.send(event);
};
router.route('/create/event').get( (req, res, next) => res.send(createChannelEventHtml));
router.route('/create/event').post( verifyToken, createNewEvent);

export { router  }