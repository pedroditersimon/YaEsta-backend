// get database
import { dbHandler } from "../DB/DatabaseHandler.mjs";

// get models
import { AccessDocument, Channel } from "../models/models.mjs";

/**
 * Fetches and validates a channel object.
 *
 * @param {(string|Channel)} channel The channel object or channel ID. If a channel ID is provided,
 *                                     the function will fetch the corresponding channel object.
 * @returns {Promise<(Channel|boolean)>} Returns the channel object if valid, otherwise false.
 */
async function getValidChannel(channel) {
    if (!(channel instanceof Channel)) {
        channel = await dbHandler.get_channel_by_id(channel);
    }
    return (channel && channel.isValid()) ? channel : false;
}

/**
 * Checks if a user is a member of a given channel.
 *
 * @param {string} user_id The ID of the user to check.
 * @param {(string|Channel)} channel The channel object or channel ID. If a channel ID is provided,
 *                                     the function will fetch the corresponding channel object.
 * @returns {Promise<boolean>} Returns true if the user is a member of the channel.
 */
export async function checkMemberChannel(user_id, channel) {
    channel = await getValidChannel(channel);
    if (!channel) return false;

    return channel.members.includes(user_id);
}

/**
 * Checks if a user is an admin of a given channel.
 *
 * @param {string} user_id The ID of the user to check.
 * @param {(string|Channel)} channel The channel object or channel ID. If a channel ID is provided,
 *                                     the function will fetch the corresponding channel object.
 * @returns {Promise<boolean>} Returns true if the user is an admin of the channel.
 */
export async function checkAdminChannel(user_id, channel) {
    channel = await getValidChannel(channel);
    if (!channel) return false;

    return channel.admins.includes(user_id);
}

/**
 * Checks if a user is both an admin and a member of a given channel.
 *
 * @param {string} user_id The ID of the user to check.
 * @param {(string|Channel)} channel The channel object or channel ID. If a channel ID is provided,
 *                                     the function will fetch the corresponding channel object.
 * @returns {Promise<boolean>} Returns true if the user is both an admin and a member of the channel.
 */
export async function checkAdminAndMemberChannel(user_id, channel) {
    channel = await getValidChannel(channel);
    if (!channel) return false;

    return channel.admins.includes(user_id) && channel.members.includes(user_id);
}


/**
 * Removes undefined properties from an object.
 * 
 * @param {Object} obj - The object to filter.
 * @returns {Object} - A new object with only defined properties.
 */
export function getOnlyDefinedFields(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
    );
}