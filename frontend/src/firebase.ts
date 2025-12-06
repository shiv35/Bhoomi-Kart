import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace this with your own Firebase config object from the Firebase console
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB15z8DfhfNtbIt8LvrX88PgbHD3ybBIdI",
  authDomain: "bhoomikart-65906.firebaseapp.com",
  projectId: "bhoomikart-65906",
  storageBucket: "bhoomikart-65906.firebasestorage.app",
  messagingSenderId: "856552282384",
  appId: "1:856552282384:web:a2fa86c19337b5d596ed95",
  measurementId: "G-ZDXLZF3QQS"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Authentication
export const auth = getAuth(app);