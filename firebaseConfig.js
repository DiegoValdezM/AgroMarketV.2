// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFQlfYrypz7Ghl-ttIRUUih4J5SJkORmE",
  authDomain: "agromarketapi-2c1bf.firebaseapp.com",
  projectId: "agromarketapi-2c1bf",
  storageBucket: "agromarketapi-2c1bf.appspot.com", // Corrige esto
  messagingSenderId: "437485670855",
  appId: "1:437485670855:web:b98b842d25e5384c0e89e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Inicializa la autenticación

// Export the initialized modules
export { app, db, auth };
