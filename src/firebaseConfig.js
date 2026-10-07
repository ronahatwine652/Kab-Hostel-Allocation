// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 1. Import getStorage

const firebaseConfig = {
    apiKey: "AIzaSyA6MHQsREP50bADR7LINfgsnhukhk7y_ME",
    authDomain: "kab-smart-hostel-allocation.firebaseapp.com",
    projectId: "kab-smart-hostel-allocation",
    storageBucket: "kab-smart-hostel-allocation.firebasestorage.app",
    messagingSenderId: "508405801007",
    appId: "1:508405801007:web:be9cd9febdc3926725a6da",
    measurementId: "G-2T95XDKK70"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // 2. Export storage
export default app;