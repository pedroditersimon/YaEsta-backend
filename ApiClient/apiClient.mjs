import doFetch from "./fetchHelper.mjs";

// Import models
import { ResponseAccessDocument, ResponseChannel, ResponseChannelEvent } from "./responseModels.mjs";

/**
 * Provides methods to interact with the API for client-side operations.
 */
export class ApiClient {
    /**
     * Creates an instance of ApiClient.
     * @param {string} baseURL The base URL of the API.
     */
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    //region Auth
    // ------------ register ------------>
    /**
     * Registers a new user.
     * @param {Object} params - The parameters for registering the new user.
     * @param {string} params.username - The username of the new user.
     * @param {string} params.password - The password for the new user.
     * @param {string} params.repeat_password - The repeated password for validation.
     * @returns {Promise<Boolean>} A promise that resolves with a boolean indicating if the registration was successful.
     */
    async register({ username, password, repeat_password }) {
        const body = {
            'username': username,
            'password': password,
            'repeat_password': repeat_password
        };

        try {
            const response = await doFetch(this.baseURL, `/register`, "POST", body);
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // ------------ login ------------>
    /**
     * Logs in a user.
     * @param {Object} params - The parameters for logging in.
     * @param {string} params.username - The username of the user.
     * @param {string} params.password - The password of the user.
     * @returns {Promise<Boolean>} A promise that resolves with a boolean indicating if the login was successful.
     */
    async login({ username, password }) {
        const body = {
            'username': username,
            'password': password,
        };

        try {
            const response = await doFetch(this.baseURL, `/login`, "POST", body);
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // ------------ logout ------------>
    /**
     * Logs out a user.
     * @returns {Promise<Boolean>} A promise that resolves with the logout response.
     */
    async logout() {
        try {
            const response = await doFetch(this.baseURL, `/logout`, "POST");
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    //endregion

    //region Channels
    // ------------ Public channel search ------------>
    /**
     * Searches for public channels by name.
     * @param {string} channelName - The name of the channel to search for.
     * @returns {Promise<Array<ResponseChannel>>} A promise that resolves with an array of public channels.
     */
    async getPublicChannels(channelName) {
        try {
            const response = await doFetch(this.baseURL, `/channels/search/${channelName}`);
            const data = await response.json();

            // error
            if (!(data instanceof Array))
                return [];

            return data.map(c => new ResponseChannel(c));
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    // ------------ Get channel by ID ------------>
    /**
     * Retrieves a channel by its ID.
     * @param {string} channelID - The ID of the channel to retrieve.
     * @returns {Promise<ResponseChannel>} A promise that resolves with the retrieved channel.
     */
    async getChannelByID(channelID) {
        try {
            const response = await doFetch(this.baseURL, `/channels/${channelID}`);
            const data = await response.json();
            return new ResponseChannel(data);
        } catch (err) {
            console.error(err);
            return new ResponseChannel();
        }
    }

    // ------------ Get channels of the logged user ------------>
    /**
     * Retrieves channels associated with the logged-in user.
     * @returns {Promise<Array<ResponseChannel>>} A promise that resolves with an array of channels associated with the user.
     */
    async getUserChannels() {
        try {
            const response = await doFetch(this.baseURL, `/channels/user`);
            const data = await response.json();
            // error
            if (!(data instanceof Array))
                return [];

            return data.map(c => new ResponseChannel(c));
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    // ------------ Create new channel ------------>
    /**
     * Creates a new channel.
     * @param {Object} params - The parameters for creating the channel.
     * @param {string} params.title - The title of the new channel.
     * @param {boolean} [params.isPublic=false] - The visibility status of the channel (public/private).
     * @returns {Promise<ResponseChannel>} A promise that resolves with the created channel.
     */
    async createNewChannel({ title, isPublic = false }) {
        const body = {
            'channel': {
                title: title,
                isPublic: isPublic
            }
        };

        try {
            const response = await doFetch(this.baseURL, `/channels/create`, "POST", body);
            const data = await response.json();
            return new ResponseChannel(data);
        } catch (err) {
            console.error(err);
            return new ResponseChannel();
        }
    }

    /**
     * Edits a channel details. You can omit parameters to keep them unchanged.
     * @param {Object} params - The parameters for editing the channel.
     * @param {string} params.channelID - The unique identifier of the channel to be edited.
     * @param {string} [params.title] - The new title for the channel.
     * @param {boolean} [params.isPublic=false] - The visibility status of the channel (public/private).
     * @returns {Promise<Boolean>} A promise that resolves with a boolean indicating if the edit was successful.
     */
    async editChannel({ channelID, title, isPublic = false }) {
        const body = {
            'channel': {
                _id: channelID,
                title: title,
                isPublic: isPublic
            }
        };
        
        try {
            const response = await doFetch(this.baseURL, `/channels/edit`, "PUT", body);
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // ------------ Delete channel ------------>
    /**
     * Deletes a channel.
     * @param {string} channelID - The ID of the channel to delete.
     * @returns {Promise<Boolean>} A promise that resolves with a boolean value indicating if the deletion was successful.
     */
    async deleteChannel(channelID) {
        try {
            const response = await doFetch(this.baseURL, `/channels/delete/${channelID}`, "DELETE");
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // ------------ Subscribe to a channel ------------>
    /**
     * Subscribes to a channel.
     * @param {string} channelID - The ID of the channel to subscribe to.
     * @returns {Promise<Boolean>} A promise that resolves with a boolean indicating whether the subscription was successful.
     */
    async subscribeToChannel(channelID) {
        try {
            const response = await doFetch(this.baseURL, `/channels/subscribe/${channelID}`, "POST");
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // ------------ Unsubscribe from a channel ------------>
    /**
     * Unsubscribes from a channel.
     * @param {string} channelID - The ID of the channel to unsubscribe from.
     * @returns {Promise<Boolean>} A promise that resolves with a boolean indicating whether the unsubscription was successful.
     */
    async unsubscribeFromChannel(channelID) {
        try {
            const response = await doFetch(this.baseURL, `/channels/unsubscribe/${channelID}`, "POST");
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    //endregion

    //region Events
    // ------------ Get event by ID ------------>
    /**
     * Retrieves an event by its ID.
     * @param {string} eventID - The ID of the event to retrieve.
     * @returns {Promise<ResponseChannelEvent>} A promise that resolves with the retrieved event.
     */
    async getEventByID(eventID) {
        try {
            const response = await doFetch(this.baseURL, `/events/${eventID}`);
            const data = await response.json();
            return new ResponseChannelEvent(data);
        } catch (err) {
            console.error(err);
            return new ResponseChannelEvent();
        }
    }

    // ------------ Get channel completed events ------------>
    /**
     * Retrieves completed events associated with a channel.
     * @param {string} channelID - The ID of the channel.
     * @returns {Promise<Array<ResponseChannelEvent>>} A promise that resolves with an array of completed events associated with the channel.
     */
    async getCompletedEventsByChannelID(channelID) {
        try {
            const response = await doFetch(this.baseURL, `/events/completed/channel/${channelID}`);
            const data = await response.json();
            // error
            if (!(data instanceof Array))
                return [];

            return data.map(ev => new ResponseChannelEvent(ev));
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    // ------------ Get channel events ------------>
    /**
     * Retrieves events associated with a channel.
     * @param {string} channelID - The ID of the channel.
     * @returns {Promise<Array<ResponseChannelEvent>>} A promise that resolves with an array of events associated with the channel.
     */
    async getEventsByChannelID(channelID) {
        try {
            const response = await doFetch(this.baseURL, `/events/channel/${channelID}`);
            const data = await response.json();
            // error
            if (!(data instanceof Array))
                return [];

            return data.map(ev => new ResponseChannelEvent(ev));
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    // ------------ Create new event ------------>
    /**
     * Creates a new event.
     * @param {Object} params - The parameters for creating the event.
     * @param {string} params.channel_id - The ID of the channel where the event is created.
     * @param {string} params.action_date - The date when the event is scheduled.
     * @param {string} [params.reminder_date] - The date when a reminder for the event should be sent.
     * @param {string} params.title - The title of the event.
     * @param {string} [params.description] - A description of the event.
     * @returns {Promise<ResponseChannelEvent>} A promise that resolves with the created event.
     */
    async createNewEvent({ channel_id, action_date, reminder_date, title, description }) {
        const body = {
            'event': {
                channel_id: channel_id,
                action_date: action_date,
                reminder_date: reminder_date,
                title: title,
                description: description
            }
        };

        try {
            const response = await doFetch(this.baseURL, `/events/create`, "POST", body);
            const data = await response.json();
            return new ResponseChannelEvent(data);
        } catch (err) {
            console.error(err);
            return new ResponseChannelEvent();
        }
    }

    // ------------ Edit event ------------>
    /**
    * Edits an event details. You can omit parameters to keep them unchanged.
    * @param {Object} params - The parameters for editing the event.
    * @param {string} params.eventID - The ID of the event to be edited.
    * @param {string} [params.action_date] - The date when the event is scheduled.
    * @param {string} [params.reminder_date] - The date when a reminder for the event should be sent.
    * @param {string} [params.title] - The title of the event.
    * @param {string} [params.description] - A description of the event.
    * @returns {Promise<boolean>} A promise that resolves with the edited event (true/false).
     */
    async editEvent({ eventID, action_date, reminder_date, title, description }) {
        const body = {
            'event': {
                _id: eventID,
                action_date: action_date,
                reminder_date: reminder_date,
                title: title,
                description: description
            }
        };

        try {
            const response = await doFetch(this.baseURL, `/events/edit`, "PUT", body);
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // ------------ Delete event ------------>
    /**
     * Deletes an event.
     * @param {string} eventID - The ID of the event to delete.
     * @returns {Promise<Boolean>} A promise that resolves with a boolean value indicating if the deletion was successful.
     */
    async deleteEvent(eventID) {
        try {
            const response = await doFetch(this.baseURL, `/events/delete/${eventID}`, "DELETE");
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    //endregion

    //region AccessDocuments
    // ------------ Get AccessDocument by ID ------------>
    /**
     * Retrieves an access document by its ID.
     * @param {string} accessDocumentId - The ID of the access document to retrieve.
     * @returns {Promise<ResponseAccessDocument>} A promise that resolves with the retrieved access document.
     */
    async getAccessDocumentByID(accessDocumentId) {
        try {
            const response = await doFetch(this.baseURL, `/access_documents/${accessDocumentId}`);
            const data = await response.json();
            return new ResponseAccessDocument(data);
        } catch (err) {
            console.error(err);
            return new ResponseAccessDocument();
        }
    }

    // ------------ Get channel AccessDocuments ------------>
    /**
     * Retrieves access documents associated with a channel.
     * @param {string} channelID - The ID of the channel.
     * @returns {Promise<Array<ResponseAccessDocument>>} A promise that resolves with an array of access documents associated with the channel.
     */
    async getAccessDocumentsByChannelID(channelID) {
        try {
            const response = await doFetch(this.baseURL, `/access_documents/channel/${channelID}`);
            const data = await response.json();
            // error
            if (!(data instanceof Array))
                return [];

            return data.map(ad => new ResponseAccessDocument(ad));
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    // ------------ Get user's AccessDocuments ------------>
    /**
     * Retrieves access documents associated with the logged-in user.
     * @returns {Promise<Array<ResponseAccessDocument>>} A promise that resolves with an array of access documents associated with the user.
     */
    async getUserAccessDocuments() {
        try {
            const response = await doFetch(this.baseURL, `/access_documents/user`);
            const data = await response.json();
            // error
            if (!(data instanceof Array))
                return [];
            
            return data.map(ad => new ResponseAccessDocument(ad));
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    // ------------ Create new AccessDocument ------------>
    /**
     * Creates a new access document.
    * @param {Object} params - The parameters for creating the access document.
    * @param {string} params.action_type - The type of action for the access document. (subscribe/create)
    * @param {string} params.target_channel_id - The ID of the target channel for the access document.
    * @param {string} params.channel_title_template - The title template for the access document.
    * @param {boolean} [params.requires_approval=false] - Indicates if the access document requires approval.
     * @returns {Promise<ResponseAccessDocument>} A promise that resolves with the created access document.
     */
    async createAccessDocument({ action_type, target_channel_id, channel_title_template, requires_approval = false }) {
          const body = {
            'accessDocument': {
                action_type: action_type,
                target_channel_id: target_channel_id,
                channel_title_template: channel_title_template,
                requires_approval: requires_approval
            }
        };

        try {
            const response = await doFetch(this.baseURL, `/access_documents/create`, "POST", body);
            const data = await response.json();
            return new ResponseAccessDocument(data);
        } catch (err) {
            console.error(err);
            return new ResponseAccessDocument();
        }
    }

    // ------------ Edit AccessDocument ------------>
    /**
     * Edits an access document. You can omit parameters to keep them unchanged.
     * @param {Object} params - The parameters for editing the access document.
     * @param {string} params.accessDocumentId - The ID of the access document to be edited.
     * @param {boolean} [params.enabled] - Indicates if the access document is enabled.
     * @param {string} [params.action_type] - The type of action for the access document (subscribe/create).
     * @param {string} [params.target_channel_id] - The ID of the target channel for the access document.
     * @param {string} [params.channel_title_template] - The title template for the access document.
     * @param {boolean} [params.requires_approval=false] - Indicates if the access document requires approval.
    * @returns {Promise<boolean>} A promise that resolves with the edited AccessDocument (true/false).
    */
    async editAccessDocument({ accessDocumentId, enabled, action_type, target_channel_id, channel_title_template, requires_approval }) {
        const body = {
            'accessDocument': {
                _id: accessDocumentId,
                enabled: enabled,
                action_type: action_type,
                target_channel_id: target_channel_id,
                channel_title_template: channel_title_template,
                requires_approval: requires_approval
            }
        };

        try {
            const response = await doFetch(this.baseURL, `/access_documents/edit`, "PUT", body);
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // ------------ Delete AccessDocument ------------>
    /**
     * Deletes an access document.
     * @param {string} accessDocumentId - The ID of the access document to delete.
     * @returns {Promise<Boolean>} A promise that resolves with a boolean value indicating if the deletion was successful.
     */
    async deleteAccessDocument(accessDocumentId) {
        try {
            const response = await doFetch(this.baseURL, `/access_documents/delete/${accessDocumentId}`, "DELETE");
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // ------------ Trigger AccessDocument ------------>
    /**
     * Triggers an access document.
     * @param {string} accessDocumentId - The ID of the access document to trigger.
     * @returns {Promise<Boolean>} A promise that resolves with a boolean value indicating if the trigger was successful.
     */
    async triggerAccessDocument(accessDocumentId) {
        try {
            const response = await doFetch(this.baseURL, `/access_documents/trigger/${accessDocumentId}`, "POST");
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    //endregion
}

// Initialize and export an instance of the ApiClient
const apiClient = new ApiClient('https://yaesta-backend.onrender.com');
export default apiClient;
