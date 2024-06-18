import doFetch from "./fetchHelper.mjs";

// Import models
import { ResponseChannel, ResponseChannelEvent } from "./responseModels.mjs";

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

    //region Auth Section
    // ------------ register ------------>
    /**
     * Registers a new user.
     * @param {string} username - The username of the new user.
     * @param {string} password - The password for the new user.
     * @param {string} repeat_password - The repeated password for validation.
     * @returns {Promise<Boolean>} A promise that resolves with the registration response.
     */
    async register(username, password, repeat_password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('repeat_password', repeat_password);

        try {
            const response = await doFetch(this.baseURL, `/register`, "POST", formData);
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    
    // ------------ login ------------>
    /**
     * Logs in a user.
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {Promise<Boolean>} A promise that resolves with the login response.
     */
    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await doFetch(this.baseURL, `/login`, "POST", formData);
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    //endregion

    //region User Section
    // ------------ Public channel search ------------>
    /**
     * Searches for public channels by name.
     * @param {string} channelName - The name of the channel to search for.
     * @returns {Promise<Array>} A promise that resolves with an array of public channels.
     */
    async getPublicChannels(channelName) {
        try {
            const response = await doFetch(this.baseURL, `/channel/search/${channelName}`);
            const data = await response.json();
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
            const response = await doFetch(this.baseURL, `/channel/${channelID}`);
            const data = await response.json();
            return new ResponseChannel(data);
        } catch (err) {
            console.error(err);
            return new ResponseChannel();
        }
    }

    // ------------ Get event by ID ------------>
    /**
     * Retrieves an event by its ID.
     * @param {string} eventID - The ID of the event to retrieve.
     * @returns {Promise<ResponseChannelEvent>} A promise that resolves with the retrieved event.
     */
    async getEventByID(eventID) {
        try {
            const response = await doFetch(this.baseURL, `/event/${eventID}`);
            const data = await response.json();
            return new ResponseChannelEvent(data);
        } catch (err) {
            console.error(err);
            return new ResponseChannelEvent();
        }
    }

    // ------------ Get channel events ------------>
    /**
     * Retrieves events associated with a channel.
     * @param {string} channelID - The ID of the channel.
     * @returns {Promise<Array>} A promise that resolves with an array of events associated with the channel.
     */
    async getChannelEvents(channelID) {
        try {
            const response = await doFetch(this.baseURL, `/channel/events/${channelID}`);
            const data = await response.json();
            return data.map(ev => new ResponseChannelEvent(ev));
        } catch (err) {
            console.error(err);
            return [];
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
            // Make a fetch request to subscribe to the channel
            const response = await doFetch(this.baseURL, `/channel/subscribe/${channelID}`);
            // Return a boolean indicating whether the subscription was successful
            return response.ok;
        } catch (err) {
            // If an error occurs, log it and return an empty array
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
            // Make a fetch request to unsubscribe from the channel
            const response = await doFetch(this.baseURL, `/channel/unsubscribe/${channelID}`);
            // Return a boolean indicating whether the unsubscription was successful
            return response.ok;
        } catch (err) {
            // If an error occurs, log it and return false
            console.error(err);
            return false;
        }
    }


    // ------------ Get logged user channels ------------>
    /**
     * Retrieves channels associated with the logged-in user.
     * @returns {Promise<Array>} A promise that resolves with an array of channels associated with the user.
     */
    async getUserChannels() {
        try {
            const response = await doFetch(this.baseURL, `/user_channels/`);
            const data = await response.json();
            return data.map(c => new ResponseChannel(c));
        } catch (err) {
            console.error(err);
            return [];
        }
    }
    //endregion

    //region Manage Section
    // ------------ Create new channel ------------>
    /**
     * Creates a new channel.
     * @param {string} title - The title of the new channel.
     * @param {boolean} isPublic - Indicates whether the channel is public or not.
     * @returns {Promise<ResponseChannel>} A promise that resolves with the created channel.
     */
    async createNewChannel(title, isPublic) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('isPublic', isPublic);

        try {
            const response = await doFetch(this.baseURL, `/create/channel`, "PUT", formData);
            const data = await response.json();
            return new ResponseChannel(data);
        } catch (err) {
            console.error(err);
            return new ResponseChannel();
        }
    }

    // ------------ Edit channel ------------>
    /**
     * Edits a channel's title.
     * @param {string} channelID - The ID of the channel to edit.
     * @param {string} newTitle - The new title for the channel.
     * @returns {Promise<ResponseChannel>} A promise that resolves with the edited channel.
     */
    async editChannel(channelID, newTitle) {
        const formData = new FormData();
        formData.append('channel_id', channelID);
        formData.append('title', newTitle);

        try {
            const response = await doFetch(this.baseURL, `/edit/channel`, "POST", formData);
            const data = await response.json();
            return new ResponseChannel(data);
        } catch (err) {
            console.error(err);
            return new ResponseChannel();
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
            const response = await doFetch(this.baseURL, `/delete/channel/${channelID}`, "DELETE");
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // ------------ Create new event ------------>
    /**
     * Creates a new event.
     * @param {string} channelID - The ID of the channel to create the event for.
     * @param {string} eventTitle - The title of the new event.
     * @returns {Promise<ResponseChannelEvent>} A promise that resolves with the created event.
     */
    async createNewEvent(channelID, eventTitle) {
        const formData = new FormData();
        formData.append('channel_id', channelID);
        formData.append('title', eventTitle);

        try {
            const response = await doFetch(this.baseURL, `/create/event`, "PUT", formData);
            const data = await response.json();
            return new ResponseChannelEvent(data);
        } catch (err) {
            console.error(err);
            return new ResponseChannelEvent();
        }
    }

    // ------------ Delete event ------------>
    /**
     * Deletes a event.
     * @param {string} channelID - The ID of the event to delete.
     * @returns {Promise<Boolean>} A promise that resolves with a boolean value indicating if the deletion was successful.
     */
    async deleteEvent(eventID) {
        try {
            const response = await doFetch(this.baseURL, `/delete/event/${eventID}`, "DELETE");
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    //endregion

}

// Initialize and export an instance of the ApiClient
const apiClient = new ApiClient('http://localhost:3001');
export default apiClient;
