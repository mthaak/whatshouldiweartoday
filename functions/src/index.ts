import * as admin from "firebase-admin";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { Expo } from "expo-server-sdk";
import { getFirestore } from "firebase-admin/firestore";
import { defineString } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { getNotificationContent } from "../../shared/src/services/notification";
import UserProfile from "../../shared/src/types/UserProfile";

const app = admin.initializeApp({
  projectId: "whatshouldiweartoday-e1a4b",
});
const db = getFirestore(app, "database");
const expo = new Expo();

const openWeatherMapAppId = defineString("OPENWEATHERMAP_APP_ID");

interface RegisterTokenData {
  token: string;
}

interface UpdateProfileData {
  userId: string;
  profile: UserProfile;
  timezone: string;
}

export const registerPushToken = onCall<RegisterTokenData>(
  {
    region: "us-central1",
    cors: true,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }

    const { token } = request.data;

    if (!Expo.isExpoPushToken(token)) {
      throw new HttpsError(
        "invalid-argument",
        `The provided push token is not valid. Token: ${token}`,
      );
    }

    try {
      await db.collection("users").doc(request.auth.uid).set(
        {
          pushToken: token,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      return { success: true };
    } catch (error) {
      console.error("Error registering push token:", error);
      throw new HttpsError(
        "internal",
        "An error occurred while registering the push token.",
      );
    }
  },
);

export const updateProfile = onCall<UpdateProfileData>(
  {
    region: "us-central1",
    cors: true,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }

    const { profile, timezone } = request.data;

    if (!profile) {
      throw new HttpsError("invalid-argument", "Profile data is required.");
    }

    try {
      await db.collection("users").doc(request.auth.uid).set(
        {
          profile,
          timezone,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new HttpsError(
        "internal",
        "An error occurred while updating profile.",
      );
    }
  },
);

// This function runs every minute to check if it's time to send notifications
export const checkAndSendNotifications = onSchedule(
  {
    schedule: "* * * * *", // Run every minute
    timeZone: "UTC", // Run in UTC to handle all timezones
    region: "us-central1",
  },
  async () => {
    try {
      const now = new Date();
      const currentTime = formatInTimeZone(now, "UTC", "HH:mm");
      const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

      console.log(
        `[${new Date().toISOString()}] Checking notifications for time:
        ${currentTime}, day: ${currentDay}`,
      );

      // Get all users with alerts enabled
      const usersSnapshot = await db
        .collection("users")
        .where("profile.alert.enabled", "==", true)
        .get();

      console.log(`Found ${usersSnapshot.size} users with alerts enabled`);

      const messages = [];

      for (const doc of usersSnapshot.docs) {
        const { pushToken, profile, timezone } = doc.data() as {
          pushToken: string;
          profile: UserProfile;
          timezone: string;
        };

        // Parse the alert time in the user's timezone
        const userAlertTime = new Date();
        userAlertTime.setHours(
          profile.alert.time.hours,
          profile.alert.time.minutes,
          0,
          0,
        );
        // Convert the user's local time to UTC
        const utcTime = formatInTimeZone(
          fromZonedTime(userAlertTime, timezone),
          "UTC",
          "HH:mm",
        );

        console.log(`Processing user ${doc.id}:`, {
          timezone: timezone,
          localAlertTime: profile.alert.time,
          utcAlertTime: utcTime,
          currentUTCTime: currentTime,
          alertForToday: profile.alert.days?.[currentDay],
        });

        // Skip if not the right time or day
        if (utcTime !== currentTime || !profile.alert.days?.[currentDay]) {
          console.log(`Skipping user ${doc.id}: wrong time or day`);
          continue;
        }

        if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
          console.warn(`Invalid push token found for user ${doc.id}`);
          continue;
        }

        const content = await getNotificationContent(
          profile,
          openWeatherMapAppId.value(),
        );
        if (!content) {
          console.warn(`No notification content found for user ${doc.id}`);
          continue;
        }

        messages.push({
          to: pushToken,
          sound: "default",
          title: content.title as string,
          body: content.body as string,
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
          console.log("Successfully sent chunk of notifications");
        } catch (error) {
          console.error("Error sending push notifications:", error);
        }
      }
    } catch (error) {
      console.error("Error in checkAndSendNotifications:", error);
    }
  },
);
