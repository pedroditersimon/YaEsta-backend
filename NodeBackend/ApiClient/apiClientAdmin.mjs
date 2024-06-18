// Import fetch helper functions
import doFetch from "./fetchHelper.mjs";

// Import response models
import { ResponseChannel, ResponseChannelEvent } from "./responseModels.mjs";


export class ApiAdminClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    //region Admin Section
    // ------------ Delete channel ------------>
    /**
     * Deletes a channel.
     * @param {string} channelID The ID of the channel to delete.
     * @returns {Promise<Boolean>} A promise that resolves with a boolean value indicating if the deletion was successful.
     */
    async deleteChannel(channelID) {
        try {
            return await doFetch(this.baseURL, `/admin/delete/channel/${channelID}`, "DELETE");
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    //endregion

}

// Initialize and export an instance of the ApiClient
const apiAdminClient = new ApiAdminClient('http://localhost:3001');
export default apiAdminClient;
