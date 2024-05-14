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
const registerHtml = await getHTML("./html_pages/register.html");
const loginHtml = await getHTML("./html_pages/login.html");

export { registerHtml, loginHtml };