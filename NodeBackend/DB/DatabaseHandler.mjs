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

        const toSendChannel = newChannel.removeCalculatedProps();
        var result = await this.mongoClient.insertOne("channels", toSendChannel);
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

        // delete all events
        var channel_events = await this.get_events_by_channel_id(channel_id);
        var channel_events_ids = channel_events.map((e)=>e._id);
        await this.mongoClient.deleteManyIDs("events", channel_events_ids);

        // delete channel from db
        var result = await this.mongoClient.deleteOneID("channels", channel._id.toString());
        return result.acknowledged == true;
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
  
        // remove user from channel members list
        var index = channel.members.indexOf(user_id);
        if (index > -1)
            channel.members.splice(index, 1);

        var insertObj = { "members": channel.members };

        // update in db
        var result = await this.mongoClient.updateOneID("channels", channel._id, insertObj);
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

        // add user to the channel members list, prevent duplicated
        if (!channel.members.includes(user_id))
            channel.members.push(user_id);

        var insertObj = { "members": channel.members };

        // update in db
        var result = await this.mongoClient.updateOneID("channels", channel._id, insertObj);
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

        return event;
    }


    async delete_event(event_id) {
        // get event
        var event = await this.get_event_by_id(event_id);
        if (!event.isValid()) 
            return false;
        
        // delete event from db
        var result = await this.mongoClient.deleteOneID("events", event_id);
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

    async get_completed_events_by_channel_id(channel_id, count=20) {
        const pipeline = [
            {
                $match: { $and: [
                    { channel_id: channel_id },
                    { status: "completed" }
                ]}
            },
            // sort by lastest events
            { $sort: { "action_date": -1 } },
            { $limit: count },
        ];
        const docs = await this.mongoClient.getAggregate("events", pipeline);

        return docs.map((d) => new ChannelEvent(d));
    }

    async get_events_by_channel_id(channel_id, count=20) {
        const pipeline = [
            {
                $match: { channel_id: channel_id }
            },
            // sort by lastest events
            { $sort: { "action_date": -1 } },
            { $limit: count },
        ];
        const docs = await this.mongoClient.getAggregate("events", pipeline);

        return docs.map((d) => new ChannelEvent(d));
    }

    async get_channels_by_user_id(user_id, count=20) {
        /*
        // get user
        var user = await this.get_user_by_id(user_id);
        if (!user.isValid())
            return null;
        */
       
        // get every channel with maximum given count
        const pipeline = [
            {
                $match: { members: {$in: [user_id]} } 
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