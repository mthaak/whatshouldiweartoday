export const browserLocalPersistence = {
  type: "LOCAL",
  async setItem(key: string, value: string) {
    return Promise.resolve();
  },
  async getItem(key: string) {
    return Promise.resolve(null);
  },
  async removeItem(key: string) {
    return Promise.resolve();
  },
};

export const initializeAuth = jest.fn(() => ({
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signInAnonymously: jest.fn(),
}));

export const signInAnonymously = jest.fn(() =>
  Promise.resolve({ user: { uid: "test-uid" } }),
);
