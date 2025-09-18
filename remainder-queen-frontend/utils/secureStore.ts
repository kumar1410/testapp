import { Platform } from 'react-native';

let secureStore: {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

if (Platform.OS === 'web') {
  secureStore = {
    getItemAsync: async (key: string) => {
      return localStorage.getItem(key);
    },
    setItemAsync: async (key: string, value: string) => {
      localStorage.setItem(key, value);
    },
    deleteItemAsync: async (key: string) => {
      localStorage.removeItem(key);
    },
  };
} else {
  // @ts-ignore
  secureStore = require('expo-secure-store');
}

export default secureStore;
