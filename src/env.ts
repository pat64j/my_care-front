const env = process.env.VUE_APP_ENV;

let envApiUrl = '';

if (env === 'production') {
  envApiUrl = `https://${process.env.VUE_APP_DOMAIN_PROD}`;
} else if (env === 'staging') {
  envApiUrl = `https://${process.env.VUE_APP_DOMAIN_STAG}`;
} else {
  envApiUrl = `http://${process.env.VUE_APP_DOMAIN_DEV}`;
}

export const apiUrl = envApiUrl;
export const appName = process.env.VUE_APP_NAME;
export const firbaseApiKey = process.env.VUE_APP_FIREBASE_API_KEY;
export const firebaseAuthDomain = process.env.VUE_APP_FIREBASE_AUTH_DOMAIN;
export const firebaseProjectId = process.env.VUE_APP_FIREBASE_PROJECT_ID;
export const firebaseStorageBucket = process.env.VUE_APP_FIREBASE_STORAGE_BUCKET;
export const firebaseMessagingSenderId = process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID;
export const firebaseAppId = process.env.VUE_APP_FIREBASE_APP_ID;
