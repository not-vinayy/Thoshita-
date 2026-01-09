import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCyLTrSSYjUSKg54fSnUOmQpOwBIO9nl8k",
    authDomain: "prepwise-22c0c.firebaseapp.com",
    projectId: "prepwise-22c0c",
    storageBucket: "prepwise-22c0c.firebasestorage.app",
    messagingSenderId: "1087938172545",
    appId: "1:1087938172545:web:bce39e908ee92e6338df80",
    measurementId: "G-VYYJZL6GQD"
};


const app = !getApps.length ? initializeApp(firebaseConfig) :getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);