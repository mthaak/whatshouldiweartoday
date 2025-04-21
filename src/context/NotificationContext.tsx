import * as Notifications from "expo-notifications";
import { Subscription } from "expo-notifications";
import { httpsCallable } from "firebase/functions";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { registerForPushNotificationsAsync } from "../common/registerForPushNotificationsAsync";
import { auth, functions } from "../config/firebase";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Wait for auth to be initialized
        if (!auth.currentUser) {
          console.log("Waiting for authentication...");
          return;
        }

        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);

        if (token) {
          // Ensure token starts with ExponentPushToken
          if (!token.startsWith("ExponentPushToken[")) {
            console.error("Invalid token format:", token);
            return;
          }

          const registerToken = httpsCallable(functions, "registerPushToken");

          const response = await registerToken({
            token: token,
          });

          // @ts-ignore
          if (response.data?.success) {
            console.log("Push token registered");
          } else {
            console.error("Failed to register push token");
          }
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    initializeNotifications();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received: ", notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "🔔 Notification Response: ",
          JSON.stringify(response, null, 2),
          JSON.stringify(response.notification.request.content.data, null, 2),
        );
        // Handle the notification response here
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [auth.currentUser]);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
