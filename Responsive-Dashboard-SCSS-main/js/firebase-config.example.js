/**
 * Przykład konfiguracji Firebase.
 * Skopiuj ten plik do `firebase-config.js` i wypełnij swoimi danymi.
 * Nie dodawaj `firebase-config.js` do repozytorium.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "WPIERW_WKLEJ_SWÓJ_API_KEY",
  authDomain: "TWÓJ_PROJECT.firebaseapp.com",
  databaseURL: "https://TWÓJ_PROJECT-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "TWÓJ_PROJECT_ID",
  storageBucket: "TWÓJ_PROJECT.appspot.com",
  messagingSenderId: "TWÓJ_MESSAGING_SENDER_ID",
  appId: "TWÓJ_APP_ID",
  measurementId: "TWÓJ_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
