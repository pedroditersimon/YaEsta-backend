import { MongoDBClient } from "./MongoDBClient.mjs";

class User {
    _id;
    username = "";
    password = "";

    // IDs list
    subscribed_channels = [];

    constructor(data=null) {
        if (data)
            Object.assign(this, data);
    }

    isValid() {
        return this._id != undefined && this._id != null;
    }
}

class Channel {
    _id;
    tittle = "";

    isPublic = false;

    // IDs list
    members = [];
    admins = [];

    // IDs list
    events = [];

    constructor(data=null) {
        if (data)
            Object.assign(this, data);
    }

    isValid() {
        return this._id != undefined && this._id != null;
    }
}

class ChannelEvent {
    _id;
    channel_id;

    tittle = "";
    description = "";

    action_date;
    notice_time;

    map_location;

    constructor(data=null) {
        if (data)
            Object.assign(this, data);
    }

    isValid() {
        return this._id != undefined && this._id != null;
    }
}


class DataBaseHandler {
    mongoClient;

    constructor() {
        this.mongoClient = new MongoDBClient({databaseName: "YaEsta"});
    }

    // ------------ api ------------>

    async get_user_by_name(username) {
        var rawUser = await this.mongoClient.findOneFrom("users", {username: username});
        return new User(rawUser);
    }

    async get_user_by_id(user_id) {
        var rawUser = await this.mongoClient.findOneIDFrom("users", user_id);
        return new User(rawUser);
    }

    async get_channel_by_id(channel_id) {
        var rawChannel = await this.mongoClient.findOneIDFrom("channels", channel_id);
        return new Channel(rawChannel);
    }

    async get_event_by_id(event_id) {
        var rawEvent = await this.mongoClient.findOneIDFrom("events", event_id);
        return new ChannelEvent(rawEvent);
    }

    async get_events_by_channel_id(channel_id, count) {
        var cursor = await this.mongoClient.getManyFrom("events", {channel_id: channel_id});

        var events = [];
        var it = 0;
        for await (const jsonObj of cursor) {
            events.push(new ChannelEvent(jsonObj));

            if (++it >= count)
                break;
        }
        return events;
    }

    async get_channels_by_user_id(user_id, count) {
        // get subscribed_channels from user
        var user = await this.get_user_by_id(user_id);
        
        // user not found, stop here
        if (!user.isValid())
            return {};

        // get every channel with maximum given count
        var subscribed_channels = this.mongoClient.getObjectIdList(user.subscribed_channels);
        var cursor = await this.mongoClient.getManyFrom("channels",
            {_id: {$in: subscribed_channels} }
        );

        var channels = [];
        var it = 0;
        for await (const jsonObj of cursor) {
            channels.push(new Channel(jsonObj));

            if (++it >= count)
                break;
        }
        return channels;
    } 

    async get_public_channels_by_tittle(channel_tittle, count) {
        // get all channels that match with given tittle (with a maximum count)
        var cursor = await this.mongoClient.getManyFrom("channels",
            {$and: [
                {tittle: {$regex: channel_tittle}},
                {isPublic: true}
        ]});

        var channels = [];
        var it = 0;
        for await (const jsonObj of cursor) {
            channels.push(new Channel(jsonObj));

            if (++it >= count)
                break;
        }
        return channels;
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

export { DataBaseHandler, dbHandler, User, Channel, ChannelEvent };