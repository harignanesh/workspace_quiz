// Firebase configuration and initialization
// Replace the below config with your own Firebase project config
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDF-3AGJssLzWIGw66eA0OQJtF8DzG1YHw",
  authDomain: "quiz-5b98d.firebaseapp.com",
  projectId: "quiz-5b98d",
  storageBucket: "quiz-5b98d.firebasestorage.app",
  messagingSenderId: "157621836184",
  appId: "1:157621836184:web:b821e856e7c3811508f3ed",
  measurementId: "G-GSC6YD51XW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
