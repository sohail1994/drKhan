// Firebase Configuration
// IMPORTANT: Replace these values with your Firebase project configuration

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your web app's Firebase configuration
// Get this from Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
    apiKey: "AIzaSyAivQLhcuPsm_A-2LpwtkG_GdMCcHEOAfU",
    authDomain: "doctor-e1640.firebaseapp.com",
    projectId: "doctor-e1640",
    storageBucket: "doctor-e1640.firebasestorage.app",
    messagingSenderId: "94360753756",
    appId: "1:94360753756:web:1e8c0c8415744f55b1f899",
    measurementId: "G-4DH1TVVM63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export app for other uses if needed
export default app;

