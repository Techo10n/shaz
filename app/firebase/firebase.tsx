// app/firebase/firebase.tsx

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getAnalytics, isSupported } from "firebase/analytics"; // Import analytics functions

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBbXTj9Praapq3nq3SCZ3UnxOuhcMMMyF8",
    authDomain: "shaz-3e8b0.firebaseapp.com",
    projectId: "shaz-3e8b0",
    storageBucket: "shaz-3e8b0.appspot.com",
    messagingSenderId: "26281967787",
    appId: "1:26281967787:web:6dd168c07a5e6d6f43f7ee",
    measurementId: "G-162M1XG290"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app); // Create a Firestore instance

// Function to initialize Analytics
export const initializeAnalytics = async () => {
  if (typeof window !== 'undefined') { // Check if running in the browser
    const analyticsSupported = await isSupported();
    if (analyticsSupported) {
      const analytics = getAnalytics(app);
      console.log("Analytics initialized", analytics);
    } else {
      console.warn("Firebase Analytics is not supported in this environment.");
    }
  }
};

// Export the db instance and initializeAnalytics function
export { db }; // Ensure db is exported
