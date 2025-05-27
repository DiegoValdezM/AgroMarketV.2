// firebaseConfig.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // <-- IMPORTACIÓN NECESARIA
import { getStorage } from "firebase/storage"; // <--- AÑADE ESTA LÍNEA

// Your web app's Firebase configuration
const firebaseCredentials = { // Renombrado para claridad, usa tus credenciales
  apiKey: "AIzaSyBFQlfYrypz7Ghl-ttIRUUih4J5SJkORmE",
  authDomain: "agromarketapi-2c1bf.firebaseapp.com",
  projectId: "agromarketapi-2c1bf",
  storageBucket: "agromarketapi-2c1bf.appspot.com",
  messagingSenderId: "437485670855",
  appId: "1:437485670855:web:b98b842d25e5384c0e89e2"
};

// Initialize Firebase
const app = initializeApp(firebaseCredentials); // Usar el objeto de credenciales


// Initialize Firebase services
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app); // <--- AÑADE ESTA LÍNEA PARA INICIALIZAR STORAGE

// Export the initialized modules
export { app, db, auth, storage }; // <--- AÑADE 'storage' A LOS EXPORTS