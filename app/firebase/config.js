import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyChtklvMVwJYb_8mxfR6WteyRTKXOG7fv8",
  authDomain: "motorq-driving-app.firebaseapp.com",
  projectId: "motorq-driving-app",
  storageBucket: "motorq-driving-app.appspot.com",
  messagingSenderId: "929190871029",
  appId: "1:929190871029:web:a4a73c51457d3cf3a2aabc",
  measurementId: "G-N5RJ0NH0GF"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };