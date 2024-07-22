// get database
import { dbHandler } from "../DB/DatabaseHandler.mjs";
// get auth
import { warningRoute, verifyToken, compareUserAuth, notAuthorizedError } from "./auth.mjs";

import { fbMessaging } from "./Google/firebase-admin.mjs";

import express from "express";
const router = express.Router();


export async function subscribeToTopic(token, topic) {
    if (!topic) {
      console.log("Invalid topic provided");
      return;
    }
    
    try {
      const response = await fbMessaging.subscribeToTopic(token, topic.toString());
      console.log('Successfully subscribeToTopic:', response);
    } catch (error) {
      console.error('Error subscribeToTopic:', error);
    }
  };
  //await subscribeToTopic();
  
  export async function unsubscribeFromTopic(token, topic) {
    try {
      const response = await fbMessaging.unsubscribeFromTopic(token, topic.toString());
      console.log('Successfully unsubscribeToTopic:', response);
    } catch (error) {
      console.error('Error unsubscribeToTopic:', error);
    }
  };
  //await unsubscribeFromTopic();
  
  export async function sendNotificationToTopic(topic, payload) {
    try {
      const response = await fbMessaging.sendToTopic(topic.toString(), payload);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  // Example usage
  /*
  const topic = 'news';
  const payload = {
    notification: {
      title: 'Breaking News',
      body: 'Something important just happened!'
    },
  };
  await sendNotificationToTopic(topic, payload);
  */

// ------------ resubscribe user notifications ------------>
router.route('/notifications/resubscribe/').post( verifyToken, resubscribe_user_notifications);
async function resubscribe_user_notifications(req, res, next) {
    var { FCM_token } = req.body;
    var auth = req.auth;
    console.log("resubscribe token: "+ FCM_token);
    var success = await dbHandler.resubscribe_user_notifications(auth._id, FCM_token);
    if (!success)
        return res.status(409).send(false);

    res.status(200).send(success);
};


export { router }