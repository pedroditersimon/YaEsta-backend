// define path vars
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Requiring fs module to read files
import { readFile } from 'fs/promises';

async function getHTML(path) {
    try {
        const data = await readFile(path);
        return data.toString();
    } catch (err) {
        throw err;
    }
}

// load html files
const registerHtml = await getHTML("./HTMLPages/register.html");
const loginHtml = await getHTML("./HTMLPages/login.html");
const createChannelHtml = await getHTML("./HTMLPages/create_channel.html");
const createChannelEventHtml = await getHTML("./HTMLPages/create_event.html");

export { registerHtml, loginHtml, createChannelHtml, createChannelEventHtml };