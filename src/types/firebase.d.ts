import { Persistence } from "firebase/auth";
import { ReactNativeAsyncStorage } from "firebase/auth/web-extension";

// https://stackoverflow.com/a/77655332
declare module "firebase/auth" {
  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage,
  ): Persistence;
}
