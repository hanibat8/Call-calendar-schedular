// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getDatabase} from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrWLxVpD6XKHucBscklyoM4kVqs5BNOR4",
  authDomain: "calendar-call-app.firebaseapp.com",
  projectId: "calendar-call-app",
  storageBucket: "calendar-call-app.appspot.com",
  messagingSenderId: "796958577928",
  appId: "1:796958577928:web:3565e2a63a5aba9e2c08bd"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db=getDatabase(app);