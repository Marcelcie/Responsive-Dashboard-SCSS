/**
 * Konfiguracja Firebase z obsługą trybu offline/fallback.
 * 
 * Klucze zostały wklejone z Firebase Console.
 * Aplikacja automatycznie korzysta z bazy chmurowej.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgqBNwAojX-j84eYatGUO0_E7qGdN-h8A",
  authDomain: "responsive-dashboard-d4b4f.firebaseapp.com",
  databaseURL: "https://responsive-dashboard-d4b4f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "responsive-dashboard-d4b4f",
  storageBucket: "responsive-dashboard-d4b4f.firebasestorage.app",
  messagingSenderId:  "449307202392",
  appId: "1:449307202392:web:413e628744a6ea3f210b2d",
  measurementId: "G-LW1MQ5Y6T4"
};

let app = null;
let database = null;
let auth = null;
let isFirebaseConfigured = false;

// Inicjalizacja Firebase
try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
  isFirebaseConfigured = true;
  console.log("🔥 Firebase zainicjalizowany pomyślnie!");
} catch (error) {
  console.error("❌ Błąd podczas inicjalizacji Firebase. Uruchamiam tryb offline:", error);
}

export { app, database, auth, isFirebaseConfigured };
export default app;
