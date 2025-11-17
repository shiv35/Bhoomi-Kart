import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace this with your own Firebase config object from the Firebase console
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiyNcghTTHXRBonV2TyAOtj5S1gCIAtf8",
  authDomain: "greencart-hackathon.firebaseapp.com",
  projectId: "greencart-hackathon",
  storageBucket: "greencart-hackathon.firebasestorage.app",
  messagingSenderId: "324707820463",
  appId: "1:324707820463:web:62b2c435757e0c4b5a455a",
  measurementId: "G-XQZ35FQ7R5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Authentication
export const auth = getAuth(app);