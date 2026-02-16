// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCymmnEZNZGPKF036HElpV7suoKAAiT5dE",
  authDomain: "huddle-7b659.firebaseapp.com",
  projectId: "huddle-7b659",
  storageBucket: "huddle-7b659.firebasestorage.app",
  messagingSenderId: "1073856606927",
  appId: "1:1073856606927:web:98da132091f60065257dba",
  measurementId: "G-RBM4ZVZK6Y"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);