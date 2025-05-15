import { getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  initializeAuth,
  signInAnonymously,
} from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyD6MpRhLAWileJ1H9R5CWIcyccepYavZgY",
  authDomain: "whatshouldiweartoday-e1a4b.firebaseapp.com",
  projectId: "whatshouldiweartoday-e1a4b",
  storageBucket: "whatshouldiweartoday-e1a4b.firebasestorage.app",
  messagingSenderId: "17607078543",
  appId: "1:17607078543:web:bdfb8a07c7aa8c560776fa",
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
});

export const functions = getFunctions(app);
export { auth };

// Sign in anonymously
export const signInAnonymouslyUser = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};
