import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

const serviceAccountPath = join("", process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH);
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const fbMessaging = admin.messaging();

export {admin, fbMessaging};
