declare module "expo-server-sdk" {
  /** Interface for Expo push notification messages */
  interface ExpoPushMessage {
    to: string;
    sound?: string;
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  }

  /** Interface for Expo push notification results */
  interface ExpoPushResult {
    status: "ok" | "error";
    message?: string;
    details?: {
      error?: string;
      [key: string]: unknown;
    };
  }

  /**
   * Expo server SDK for sending push notifications
   */
  export class Expo {
    /** Creates a new Expo instance */
    constructor();
    /** Checks if a token is a valid Expo push token */
    static isExpoPushToken(token: string): boolean;
    /** Splits messages into chunks for batch sending */
    chunkPushNotifications(messages: ExpoPushMessage[]): ExpoPushMessage[][];
    /** Sends push notifications to Expo servers */
    sendPushNotificationsAsync(
      messages: ExpoPushMessage[],
    ): Promise<ExpoPushResult[]>;
  }
}
