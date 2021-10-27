import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore'
import {
    firbaseApiKey, firebaseAuthDomain, firebaseProjectId, firebaseStorageBucket,
    firebaseMessagingSenderId, firebaseAppId
} from '@/env';


const firebaseConfig = {
    apiKey: firbaseApiKey,
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId,
    appId: firebaseAppId,
};

const meetup_fg = initializeApp(firebaseConfig);

const auth = getAuth(meetup_fg)
const storage = getStorage(meetup_fg)
const db = getFirestore(meetup_fg)

// onAuthStateChanged(auth, user => {
//     console.log('logging user....');
//     console.log(user);
// });

export { auth, storage, db }