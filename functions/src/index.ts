import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { Expo } from "expo-server-sdk";

// Initialize Firebase Admin with explicit database URL
const app = admin.initializeApp({
  projectId: "whatshouldiweartoday-e1a4b",
});
const db = getFirestore(app, "app-db");
const expo = new Expo();

interface RegisterTokenData {
  token: string;
  userId: string;
  timezone?: string;
}

interface UpdateAlertSettingsData {
  userId: string;
  alertTime: string; // Format: "HH:mm" in 24-hour format
  alertDays: boolean[]; // Array of 7 booleans representing days of the week (0 = Sunday, 6 = Saturday)
  alertEnabled: boolean;
  timezone?: string; // Optional timezone, defaults to "Europe/London"
}

export const registerPushToken = onCall<RegisterTokenData>({
  region: "us-central1",
  cors: true,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const { token, userId, timezone = "Europe/London" } = request.data;

  if (!Expo.isExpoPushToken(token)) {
    throw new HttpsError(
      "invalid-argument",
      `The provided push token is not valid. Token: ${token}`,
    );
  }

  try {
    await db.collection("users").doc(userId).set({
      pushToken: token,
      timezone,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error registering push token:", error);
    throw new HttpsError(
      "internal",
      "An error occurred while registering the push token.",
    );
  }
});

export const updateAlertSettings = onCall<UpdateAlertSettingsData>({
  region: "us-central1",
  cors: true,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const { userId, alertTime, alertDays, alertEnabled, timezone = "Europe/London" } = request.data;

  if (!alertTime || !alertDays || alertDays.length !== 7) {
    throw new HttpsError(
      "invalid-argument",
      "Both alertTime and alertDays (7 days) are required.",
    );
  }

  try {
    await db.collection("users").doc(userId).set({
      alertTime,
      alertDays,
      alertEnabled,
      timezone,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error updating alert settings:", error);
    throw new HttpsError(
      "internal",
      "An error occurred while updating alert settings.",
    );
  }
});

// This function runs every minute to check if it's time to send notifications
export const checkAndSendNotifications = onSchedule({
  schedule: "* * * * *", // Run every minute
  timeZone: "UTC", // Run in UTC to handle all timezones
  region: "us-central1",
}, async () => {
  try {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`;
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    console.log(`[${new Date().toISOString()}] Checking notifications for time: ${currentTime}, day: ${currentDay}`);

    // Get all users with alerts enabled
    const usersSnapshot = await db
      .collection("users")
      .where("alertEnabled", "==", true)
      .get();

    console.log(`Found ${usersSnapshot.size} users with alerts enabled`);

    const messages = [];

    for (const doc of usersSnapshot.docs) {
      const { pushToken, alertTime, alertDays, timezone = "Europe/London" } = doc.data();
      
      // Convert the user's alert time to UTC based on their timezone
      const [alertHour, alertMinute] = alertTime.split(":");
      const userAlertTime = new Date();
      userAlertTime.setHours(parseInt(alertHour), parseInt(alertMinute), 0, 0);
      
      // Convert to UTC
      const utcAlertTime = new Date(userAlertTime.toLocaleString("en-US", { timeZone: timezone }));
      const utcHour = utcAlertTime.getHours().toString().padStart(2, "0");
      const utcMinute = utcAlertTime.getMinutes().toString().padStart(2, "0");
      const utcTime = `${utcHour}:${utcMinute}`;

      console.log(`Processing user ${doc.id}:`, { 
        timezone,
        localAlertTime: alertTime,
        utcAlertTime: utcTime,
        currentUTCTime: currentTime,
        alertForToday: alertDays?.[currentDay]
      });

      // Skip if not the right time or day
      if (utcTime !== currentTime || !alertDays?.[currentDay]) {
        console.log(`Skipping user ${doc.id}: wrong time or day`);
        continue;
      }
      
      if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        console.warn(`Invalid push token found for user ${doc.id}`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: "default",
        title: "Good Morning!",
        body: "Time to check today's weather and pick your outfit!",
        data: { type: "daily_reminder" },
      });
    }

    if (messages.length === 0) {
      console.log(`No notifications to send at ${currentTime}`);
      return;
    }

    console.log(`Preparing to send ${messages.length} notifications`);

    const chunks = expo.chunkPushNotifications(messages);
    
    for (const chunk of chunks) {
      try {
        console.log(`Sending chunk of ${chunk.length} notifications`);
        await expo.sendPushNotificationsAsync(chunk);
        console.log(`Successfully sent chunk of notifications`);
      } catch (error) {
        console.error("Error sending push notifications:", error);
      }
    }
  } catch (error) {
    console.error("Error in checkAndSendNotifications:", error);
  }
});
