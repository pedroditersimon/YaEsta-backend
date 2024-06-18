import { MongoDBClient } from "./MongoDBClient.mjs";

// get models
import { User, Channel, ChannelEvent } from "../models/models.mjs";
import { ObjectId } from "mongodb";
import { raw } from "express";


class DataBaseHandler {
    mongoClient;

    constructor() {
        this.mongoClient = new MongoDBClient({databaseName: "YaEsta"});
    }


    // ------------ manage channels, events and users ------------>
    
    async create_new_channel(newChannel) {
        // invalid given Channel object
        if (!(newChannel instanceof Channel))
            return new Channel();

        var result = await this.mongoClient.insertOne("channels", newChannel);
        if (!result.acknowledged)
            return new Channel();

        const channel_id = result.insertedId.toString();

        var channel = await this.get_channel_by_id(channel_id);
        if (!channel.isValid()) 
            return new Channel();

        return channel;
    }

    // TODO: dont delete, mark a property as deleted
    async delete_channel(channel_id) {
        // get channel
        var channel = await this.get_channel_by_id(channel_id);
        if (!channel.isValid()) 
            return false;
        
        // unsubscribe all users
        for (var i = 0; i < channel.members.length; i++) {
            var user_id = channel.members[i];
            await this.unsubscribe_user_from_channel(user_id, channel._id.toString());
        }

        // delete all events
        for (var i = 0; i < channel.events.length; i++) {
            var event_id = channel.events[i];
            await this.delete_event(event_id);
        }

        // delete channel from db
        var result = await this.mongoClient.deleteOne("channels", channel._id.toString());
        return result.acknowledged;
    }


    async unsubscribe_user_from_channel(user_id, channel_id) {
        // get user
        var user = await this.get_user_by_id(user_id);
        if (!user.isValid()) 
            return false;

        // get channel
        var channel = await this.get_channel_by_id(channel_id);
        if (!channel.isValid()) 
            return false;

        var index;

        // remove from list
        index = user.subscribed_channels.indexOf(channel_id);
        if (index > -1)
            user.subscribed_channels.splice(index, 1);

        // remove from list
        index = channel.members.indexOf(user_id);
        if (index > -1)
            channel.members.splice(index, 1);

        var insertObj =
        [
            { $set: {"subscribed_channels": user.subscribed_channels} },
            { $unset: ["_id"] } // remove _id from setter
        ];

        insertObj = {"subscribed_channels": user.subscribed_channels};

        // update in db
        var result = await this.mongoClient.updateOne("users", {_id:user._id}, insertObj);
        if (!result.acknowledged)
            return false;

        var insertObj =
        [
            { $set: {"members": channel.members} },
            { $unset: ["_id"] } // remove _id from setter
        ];

        insertObj = {"members": channel.members};

        // update in db
        var result = await this.mongoClient.updateOne("channels", {_id:channel._id}, insertObj);
        if (!result.acknowledged)
            return false;

        return true;
    }


    async subscribe_user_to_channel(user_id, channel_id) {
        // get user
        var user = await this.get_user_by_id(user_id);
        if (!user.isValid()) 
            return false;

        // get channel
        var channel = await this.get_channel_by_id(channel_id);
        if (!channel.isValid()) 
            return false;

        // add to list, prevent duplicated
        if (!user.subscribed_channels.includes(channel_id))
            user.subscribed_channels.push(channel_id);

        // add to list, prevent duplicated
        if (!channel.members.includes(user_id))
            channel.members.push(user_id);

        var insertObj =
        [
            { $set: {"subscribed_channels": user.subscribed_channels} },
            { $unset: ["_id"] } // remove _id from setter
        ];

        insertObj = {"subscribed_channels": user.subscribed_channels};

        // update in db
        var result = await this.mongoClient.updateOne("users", {_id:user._id}, insertObj);
        if (!result.acknowledged)
            return false;

        var insertObj =
        [
            { $set: {"members": channel.members} },
            { $unset: ["_id"] } // remove _id from setter
        ];

        insertObj = {"members": channel.members};

        // update in db
        var result = await this.mongoClient.updateOne("channels", {_id:channel._id}, insertObj);
        if (!result.acknowledged)
            return false;

        return true;
    }



    async create_new_event(newEvent) {
        // invalid given Event object
        if (!(newEvent instanceof ChannelEvent))
            return new ChannelEvent();

        // get channel
        var channel = await this.get_channel_by_id(newEvent.channel_id);
        if (!channel.isValid()) 
            return new ChannelEvent();

        var result = await this.mongoClient.insertOne("events", newEvent);
        if (!result.acknowledged)
            return new ChannelEvent();

        const event_id = result.insertedId.toString();

        // get created event
        var event = await this.get_event_by_id(event_id);
        if (!event.isValid()) 
            return new ChannelEvent();

        // already in, prevent duplicated
        if (channel.events.includes(event_id))
            return event;

        // add to list
        channel.events.push(event_id);

        var insertObj =
        [
            { $set: {"events": channel.events} },
            { $unset: ["_id"] } // remove _id from setter
        ];

        insertObj = {"events": channel.events};

        // update in db
        var result = await this.mongoClient.updateOneID("channels", channel._id.toString(), insertObj);
        if (!result.acknowledged)
            return new ChannelEvent();

        return event;
    }


    async delete_event(event_id) {
        // get event
        var event = await this.get_event_by_id(event_id);
        if (!event.isValid()) 
            return false;
        
        // get channel
        var channel = await this.get_channel_by_id(event.channel_id);
        if (!channel.isValid()) 
            return false;

        // remove from list
        var index = channel.events.indexOf(event_id);
        if (index > -1)
            channel.events.splice(index, 1);

        var insertObj =
        [
            { $set: {"events": channel.events} },
            { $unset: ["_id"] } // remove _id from setter
        ];

        insertObj = {"events": channel.events};

        // update in db
        var result = await this.mongoClient.updateOne("channels", {_id:channel._id}, insertObj);
        if (!result.acknowledged)
            return false;

        // delete event from db
        var result = await this.mongoClient.deleteOne("events", event._id.toString());
        return result.acknowledged;
    }

    // ------------ getters ------------>

    async get_user_by_name(username) {
        var rawUser = await this.mongoClient.findOneFrom("users", {username: username});
        return new User(rawUser);
    }

    async get_user_by_id(user_id) {
        var rawUser = await this.mongoClient.findOneIDFrom("users", user_id);
        return new User(rawUser);
    }

    async get_channel_by_id(channel_id) {
        var rawChannel = await this.mongoClient.findOneIDFrom("channels", channel_id, Channel.getPipeline());
        return new Channel(rawChannel);
    }

    async get_event_by_id(event_id) {
        var rawEvent = await this.mongoClient.findOneIDFrom("events", event_id);
        return new ChannelEvent(rawEvent);
    }

    async get_events_by_channel_id(channel_id, count=20) {
        const pipeline = [
            { 
                $match: { channel_id: channel_id } 
            },
            { $limit: count },
        ];
        const docs = await this.mongoClient.getAggregate("events", pipeline);

        return docs.map((d) => new ChannelEvent(d));
    }

    async get_channels_by_user_id(user_id, count=20) {
        // get subscribed_channels from user
        var user = await this.get_user_by_id(user_id);
        
        // user not found, stop here
        if (!user.isValid())
            return null;

        // convert string ids from ObjectId of mongo
        var subscribed_channels = this.mongoClient.getObjectIdList(user.subscribed_channels);

        // get every channel with maximum given count
        const pipeline = [
            { 
                $match: { _id: {$in: subscribed_channels} } 
            },
            { $limit: count },
            ...Channel.getPipeline(),
        ];
        const docs = await this.mongoClient.getAggregate("channels", pipeline);

        return docs.map((d) => new Channel(d));
    } 

    async get_public_channels_by_title(channel_title, count=20) {
        const pipeline = [
            { 
                $match: { 
                    $and: [
                        { title: { $regex: channel_title } },
                        { isPublic: true }
                ]}
            },
            { $limit: count },
            ...Channel.getPipeline(),
        ];
        const docs = await this.mongoClient.getAggregate("channels", pipeline);
        return docs.map((d) => new Channel(d));
    } 


    // ------------ auth ------------>

    async get_user_by_credentials(username, password) {
        var rawUser = await this.mongoClient.findOneFrom("users", {
            username: username,
            password: password
        });
        return new User(rawUser);
    }

    async username_exists(username) {
        var user = await this.get_user_by_name(username);
        return user.isValid();
    }

    async register_user(user) {
        var created_user = await this.mongoClient.insertOne("users", user);
        return created_user;
    }
}

// connect database
const dbHandler = new DataBaseHandler();

export { DataBaseHandler, dbHandler };