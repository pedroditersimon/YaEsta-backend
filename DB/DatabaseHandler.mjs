import 'dotenv/config';
import MongoDBClient from "./MongoDBClient.mjs";

// get models
import { User, Channel, ChannelEvent, AccessDocument } from "../models/models.mjs";
import { ObjectId } from "mongodb";
 
export class DataBaseHandler {
    mongoClient;

    constructor() {
        const uri = process.env.MONGODB_URI
            .replace("<user>", process.env.MONGODB_USER)
            .replace("<password>", process.env.MONGODB_USER_PASS);

        this.mongoClient = new MongoDBClient({URI: uri, databaseName: "YaEsta"});
    }

    //region auth
    // ------------ auth ------------>

    /**
     * Retrieves a user by their credentials.
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {Promise<User>} A promise that resolves with the retrieved user.
     */
    async get_user_by_credentials(username, password) {
        var rawUser = await this.mongoClient.findOneFrom("users", {
            username: username,
            password: password
        });
        return new User(rawUser);
    }

    /**
     * Checks if a username already exists in the database.
     * @param {string} username - The username to check.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the username exists.
     */
    async username_exists(username) {
        var user = await this.get_user_by_name(username);
        return user.isValid();
    }

    /**
     * Registers a new user in the database.
     * @param {User} user - The user object to register.
     * @returns {Promise<User>} A promise that resolves with the created user.
     */
    async register_user(user) {
        var created_user = await this.mongoClient.insertOne("users", user);
        return created_user;
    }

    /**
     * Retrieves a user by their username.
     * @param {string} username - The username of the user.
     * @returns {Promise<User>} A promise that resolves with the retrieved user.
     */
    async get_user_by_name(username) {
        var rawUser = await this.mongoClient.findOneFrom("users", { username: username });
        return new User(rawUser);
    }

    /**
     * Retrieves a user by their ID.
     * @param {string} user_id - The ID of the user.
     * @returns {Promise<User>} A promise that resolves with the retrieved user.
     */
    async get_user_by_id(user_id) {
        var rawUser = await this.mongoClient.findOneIDFrom("users", user_id);
        return new User(rawUser);
    }

    //endregion

    //region Channels

    /**
     * Retrieves a channel by its ID.
     * @param {string} channel_id - The ID of the channel.
     * @returns {Promise<Channel>} A promise that resolves with the retrieved channel.
     */
    async get_channel_by_id(channel_id) {
        var rawChannel = await this.mongoClient.findOneIDFrom("channels", channel_id, Channel.getPipeline());
        return new Channel(rawChannel);
    }

    /**
     * Retrieves channels associated with a user ID.
     * @param {string} user_id - The ID of the user.
     * @param {number} count - The maximum number of channels to retrieve.
     * @returns {Promise<Array<Channel>>} A promise that resolves with an array of channels.
     */
    async get_channels_by_user_id(user_id, count = 20) {
        const pipeline = [
            { $match: { members: { $in: [user_id] } } },
            { $limit: count },
            ...Channel.getPipeline(),
        ];
        const docs = await this.mongoClient.getAggregate("channels", pipeline);
        return docs.map((d) => new Channel(d));
    }

    /**
     * Retrieves public channels by their title.
     * @param {string} channel_title - The title of the channels.
     * @param {number} count - The maximum number of channels to retrieve.
     * @returns {Promise<Array<Channel>>} A promise that resolves with an array of channels.
     */
    async get_public_channels_by_title(channel_title, count = 20) {
        const pipeline = [
            {
                $match: {
                    $and: [
                        { title: { $regex: channel_title } },
                        { isPublic: true }
                    ]
                }
            },
            { $limit: count },
            ...Channel.getPipeline(),
        ];
        const docs = await this.mongoClient.getAggregate("channels", pipeline);
        return docs.map((d) => new Channel(d));
    }

    /**
     * Creates a new channel.
     * @param {Channel} newChannel - The new channel object to create.
     * @returns {Promise<Channel>} A promise that resolves with the created channel.
     */
    async create_new_channel(newChannel) {
        if (!(newChannel instanceof Channel))
            return new Channel();

        const channelToInsert = new Channel(newChannel);
        channelToInsert.removeCalculatedProps();

        var result = await this.mongoClient.insertOne("channels", channelToInsert);
        if (!result.acknowledged)
            return new Channel();

        const insertedId = result.insertedId.toString();
        var channel = await this.get_channel_by_id(insertedId);
        if (!channel.isValid())
            return new Channel();

        return channel;
    }

    /**
     * Deletes a channel.
     * @param {string} channel_id - The ID of the channel to delete.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the deletion was successful.
     */
    async delete_channel(channel_id) {
        var channel = await this.get_channel_by_id(channel_id);
        if (!channel.isValid())
            return false;

        var channel_events = await this.get_events_by_channel_id(channel_id);
        var channel_events_ids = channel_events.map((e) => e._id);
        await this.mongoClient.deleteManyIDs("events", channel_events_ids);

        var result = await this.mongoClient.deleteOneID("channels", channel._id.toString());
        return result.acknowledged == true;
    }

    /**
     * Updates a channel's details.
     * @param {Channel} channel - The channel object with updated details.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the update was successful.
     */
    async update_channel(channel) {
        if (!(channel instanceof Channel))
            return false;

        const result = await this.mongoClient.updateOneID("channels", channel._id, channel);
        return result.acknowledged == true;
    }

    /**
     * Unsubscribes a user from a channel.
     * @param {string} user_id - The ID of the user.
     * @param {string} channel_id - The ID of the channel.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the unsubscription was successful.
     */
    async unsubscribe_user_from_channel(user_id, channel_id) {
        var user = await this.get_user_by_id(user_id);
        if (!user.isValid())
            return false;

        var channel = await this.get_channel_by_id(channel_id);
        if (!channel.isValid())
            return false;

        var index = channel.members.indexOf(user_id);
        if (index > -1)
            channel.members.splice(index, 1);

        var insertObj = { "members": channel.members };

        var result = await this.mongoClient.updateOneID("channels", channel._id, insertObj);
        if (!result.acknowledged)
            return false;

        return true;
    }

    /**
     * Subscribes a user to a channel.
     * @param {string} user_id - The ID of the user.
     * @param {string} channel_id - The ID of the channel.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the subscription was successful.
     */
    async subscribe_user_to_channel(user_id, channel_id) {
        var user = await this.get_user_by_id(user_id);
        if (!user.isValid())
            return false;

        var channel = await this.get_channel_by_id(channel_id);
        if (!channel.isValid())
            return false;

        if (!channel.members.includes(user_id))
            channel.members.push(user_id);

        var insertObj = { "members": channel.members };

        var result = await this.mongoClient.updateOneID("channels", channel._id, insertObj);
        if (!result.acknowledged)
            return false;

        return true;
    }

    //endregion

    //region Events
    // ------------ getters ------------>

    /**
     * Retrieves an event by its ID.
     * @param {string} event_id - The ID of the event.
     * @returns {Promise<ChannelEvent>} A promise that resolves with the retrieved event.
     */
    async get_event_by_id(event_id) {
        var rawEvent = await this.mongoClient.findOneIDFrom("events", event_id);
        return new ChannelEvent(rawEvent);
    }

    /**
     * Retrieves completed events associated with a channel ID.
     * @param {string} channel_id - The ID of the channel.
     * @param {number} count - The maximum number of events to retrieve.
     * @returns {Promise<Array<ChannelEvent>>} A promise that resolves with an array of events.
     */
    async get_completed_events_by_channel_id(channel_id, count = 20) {
        const pipeline = [
            {
                $match: {
                    $and: [
                        { channel_id: channel_id },
                        { status: "completed" }
                    ]
                }
            },
            { $limit: count },
            { $sort: { "action_date": -1 } },
        ];
        const docs = await this.mongoClient.getAggregate("events", pipeline);
        return docs.map((d) => new ChannelEvent(d));
    }

    /**
     * Retrieves events associated with a channel ID.
     * @param {string} channel_id - The ID of the channel.
     * @param {number} count - The maximum number of events to retrieve.
     * @returns {Promise<Array<ChannelEvent>>} A promise that resolves with an array of events.
     */
    async get_events_by_channel_id(channel_id, count = 20) {
        const pipeline = [
            { $match: { channel_id: channel_id } },
            { $limit: count },
            { $sort: { "action_date": -1 } },
        ];
        const docs = await this.mongoClient.getAggregate("events", pipeline);
        return docs.map((d) => new ChannelEvent(d));
    }

    /**
     * Retrieves upcoming global (pending) events within a specified time threshold.
     * @param {number} threshold_ms - The time threshold in milliseconds. Events 
     *                                occurring after this threshold will not be retrieved.
     * @param {number} [count=20] - The maximum number of events to retrieve.
     * @returns {Promise<Array<ChannelEvent>>} A promise that resolves with an array of ChannelEvent objects.
     */
    async get_global_upcoming_events(threshold_ms, count = 20) {
        // Create a threshold date by adding the specified milliseconds to the current date
        const threshold_time = new Date();
        threshold_time.setMilliseconds(threshold_time.getMilliseconds() + threshold_ms);

        // Define the MongoDB aggregation pipeline
        const pipeline = [
            { $match: { "status": "pending" } },
            { $match: { "action_date": { $lte: threshold_time.toISOString() } } },
            { $limit: count },
            { $sort: { "action_date": 1 } },
        ];

        const docs = await this.mongoClient.getAggregate("events", pipeline);
        return docs.map((d) => new ChannelEvent(d));
    }

    /**
     * Retrieves registered global events.
     * @param {number} [count=20] - The maximum number of events to retrieve.
     * @returns {Promise<Array<ChannelEvent>>} A promise that resolves with an array of ChannelEvent objects.
     */
    async get_global_registered_events(count = 20) {
        // Define the MongoDB aggregation pipeline
        const pipeline = [
            { $match: { "status": "registered" } },
            { $limit: count },
            { $sort: { "action_date": 1 } },
        ];

        const docs = await this.mongoClient.getAggregate("events", pipeline);
        return docs.map((d) => new ChannelEvent(d));
    }

    /**
     * Creates a new event.
     * @param {ChannelEvent} newEvent - The new event object to create.
     * @returns {Promise<ChannelEvent>} A promise that resolves with the created event.
     */
    async create_new_event(newEvent) {
        if (!(newEvent instanceof ChannelEvent))
            return new ChannelEvent();

        var channel = await this.get_channel_by_id(newEvent.channel_id);
        if (!channel.isValid())
            return new ChannelEvent();

        var result = await this.mongoClient.insertOne("events", newEvent);
        if (!result.acknowledged)
            return new ChannelEvent();

        const insertedId = result.insertedId.toString();
        var event = await this.get_event_by_id(insertedId);
        if (!event.isValid())
            return new ChannelEvent();

        return event;
    }

    /**
     * Deletes an event.
     * @param {string} event_id - The ID of the event to delete.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the deletion was successful.
     */
    async delete_event(event_id) {
        var event = await this.get_event_by_id(event_id);
        if (!event.isValid())
            return false;

        var result = await this.mongoClient.deleteOneID("events", event_id);
        return result.acknowledged == true;
    }

    /**
     * Updates an event's details.
     * @param {ChannelEvent} event - The event object with updated details.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the update was successful.
     */
    async update_event(event) {
        if (!(event instanceof ChannelEvent))
            return false;

        const result = await this.mongoClient.updateOneID("events", event._id, event);
        return result.acknowledged == true;
    }

    //endregion

    //region AccessDocument
    // ------------ Access Document ------------>

    /**
     * Retrieves an access document by its ID.
     * @param {string} access_document_id - The ID of the access document.
     * @returns {Promise<AccessDocument>} A promise that resolves with the retrieved access document.
     */
    async get_access_document_by_id(access_document_id) {
        const doc = await this.mongoClient.findOneIDFrom("accessDocuments", access_document_id);
        return new AccessDocument(doc);
    }

    /**
     * Retrieves access documents associated with a channel ID.
     * @param {string} channel_id - The ID of the channel.
     * @param {number} count - The maximum number of access documents to retrieve.
     * @returns {Promise<Array<AccessDocument>>} A promise that resolves with an array of access documents.
     */
    async get_access_documents_by_channel_id(channel_id, count = 20) {
        const pipeline = [
            { $match: { target_channel_id: channel_id } },
            { $limit: count },
            { $sort: { "creation_date": -1 } },
        ];
        const docs = await this.mongoClient.getAggregate("accessDocuments", pipeline);
        return docs.map((d) => new AccessDocument(d));
    }

    /**
     * Retrieves access documents associated with a creator ID.
     * @param {string} creator_id - The ID of the creator.
     * @param {number} count - The maximum number of access documents to retrieve.
     * @returns {Promise<Array<AccessDocument>>} A promise that resolves with an array of access documents.
     */
    async get_access_documents_by_creator_id(creator_id, count = 20) {
        const pipeline = [
            { $match: { creator_user_id: creator_id } },
            { $limit: count },
            { $sort: { "creation_date": -1 } },
        ];
        const docs = await this.mongoClient.getAggregate("accessDocuments", pipeline);
        return docs.map((d) => new AccessDocument(d));
    }

    /**
     * Retrieves access documents created by a specific creator ID.
     * @param {string} creator_id - The ID of the creator.
     * @param {number} count - The maximum number of access documents to retrieve.
     * @returns {Promise<Array<AccessDocument>>} A promise that resolves with an array of access documents.
     */
    async get_create_access_documents_by_creator_id(creator_id, count = 20) {
        const pipeline = [
            {
                $match: {
                    $and: [
                        { action_type: "create" },
                        { creator_user_id: creator_id }
                    ]
                }
            },
            { $limit: count },
            { $sort: { "creation_date": -1 } },
        ];
        const docs = await this.mongoClient.getAggregate("accessDocuments", pipeline);
        return docs.map((d) => new AccessDocument(d));
    }

    /**
     * Creates a new access document.
     * @param {AccessDocument} newAccessDocument - The new access document object to create.
     * @returns {Promise<AccessDocument>} A promise that resolves with the created access document.
     */
    async create_new_access_document(newAccessDocument) {
        if (!(newAccessDocument instanceof AccessDocument))
            return new AccessDocument();

        var result = await this.mongoClient.insertOne("accessDocuments", newAccessDocument);
        if (!result.acknowledged)
            return new AccessDocument();

        const insertedId = result.insertedId.toString();
        var accessDocument = await this.get_access_document_by_id(insertedId);
        if (!accessDocument.isValid())
            return new AccessDocument();

        return accessDocument;
    }

    /**
     * Deletes an access document.
     * @param {string} access_document_id - The ID of the access document to delete.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the deletion was successful.
     */
    async delete_access_document(access_document_id) {
        var accessDocument = await this.get_access_document_by_id(access_document_id);
        if (!accessDocument.isValid())
            return false;

        var result = await this.mongoClient.deleteOneID("accessDocuments", access_document_id);
        return result.acknowledged == true;
    }

    /**
     * Updates an access document's details.
     * @param {AccessDocument} accessDocument - The access document object with updated details.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the update was successful.
     */
    async update_access_document(accessDocument) {
        if (!(accessDocument instanceof AccessDocument))
            return false;

        const result = await this.mongoClient.updateOneID("accessDocuments", accessDocument._id, accessDocument);
        return result.acknowledged == true;
    }

    //endregion

}

// connect database
export const dbHandler = new DataBaseHandler();
