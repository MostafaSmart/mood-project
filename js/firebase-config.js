// js/firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDz0UXCOTn6iSjWxx_ZixffLKvEPohhQzc",
  authDomain: "aaabss.firebaseapp.com",
  projectId: "aaabss",
  storageBucket: "aaabss.firebasestorage.app",
  messagingSenderId: "5585638195",
  appId: "1:5585638195:web:da151736c835b17d19a446",
  measurementId: "G-16Q31P962G"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);