/**
 * 🛠️ FUNKCJE POMOCNICZE FIREBASE & LOCAL STORAGE
 * 
 * Ten plik obsługuje zarówno Firebase, jak i LocalStorage jako fallback,
 * dzięki czemu aplikacja działa poprawnie lokalnie (offline) bez konfiguracji.
 */

import { 
  ref,                    
  set,                    
  get,                    
  update,                 
  remove,                 
  onValue,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

import {
  createUserWithEmailAndPassword,  
  signInWithEmailAndPassword,      
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";


import { database, auth, isFirebaseConfigured } from "./firebase-config.js";
// Lista słuchaczy stanu zalogowania dla trybu offline
const authListeners = [];

/**
 * Zwraca zalogowanego użytkownika lub null
 */
export function pobierzAktualnegoUzytkownika() {
  if (isFirebaseConfigured) {
    return auth.currentUser;
  } else {
    const userJson = localStorage.getItem("dashboard_active_user");
    return userJson ? JSON.parse(userJson) : null;
  }
}

/**
 * 👤 MONITOROWANIE STANU ZALOGOWANIA
 * 
 * @param {function} callback - funkcja wywoływana przy zmianie stanu autoryzacji
 */
export function sprawdzStanAutoryzacji(callback) {
  if (isFirebaseConfigured) {
    return onAuthStateChanged(auth, callback);
  } else {
    // Tryb offline
    authListeners.push(callback);
    // Wywołaj od razu z obecnym stanem
    const uzytkownik = pobierzAktualnegoUzytkownika();
    callback(uzytkownik);
    
    // Zwróć funkcję odsubskrybowania
    return () => {
      const index = authListeners.indexOf(callback);
      if (index > -1) authListeners.splice(index, 1);
    };
  }
}

// Pomocnicza funkcja do wywoływania słuchaczy w trybie offline
function powiadomSluchaczyAuth(uzytkownik) {
  authListeners.forEach(callback => callback(uzytkownik));
}

/**
 * ✍️ ZAPISYWANIE DANYCH
 * 
 * @param {string} sciezka - ścieżka w bazie (np. "zdarzenia/zdarzenie1")
 * @param {object} dane - obiekt do zapisu
 */
export async function zapiszDane(sciezka, dane) {
  if (isFirebaseConfigured) {
    try {
      await set(ref(database, sciezka), dane);
      console.log("✅ [Firebase] Dane zapisane pomyślnie!");
      return true;
    } catch (blad) {
      console.error("❌ [Firebase] Błąd zapisu:", blad);
      return false;
    }
  } else {
    // Tryb offline (LocalStorage)
    try {
      localStorage.setItem("db_" + sciezka, JSON.stringify(dane));
      console.log(`✅ [Offline] Zapisano dane pod kluczem: db_${sciezka}`);
      
      // Wywołaj zdarzenie zmiany, jeśli ktoś obserwuje
      window.dispatchEvent(new CustomEvent("localstorage_change", { detail: { sciezka, dane } }));
      return true;
    } catch (e) {
      console.error("❌ [Offline] Błąd zapisu do LocalStorage:", e);
      return false;
    }
  }
}

/**
 * 📖 CZYTANIE JEDNORAZOWE
 * 
 * @param {string} sciezka - ścieżka do danych
 */
export async function czytajDane(sciezka) {
  if (isFirebaseConfigured) {
    try {
      const snapshot = await get(ref(database, sciezka));
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (blad) {
      console.error("❌ [Firebase] Błąd czytania:", blad);
      return null;
    }
  } else {
    // Tryb offline
    try {
      const dane = localStorage.getItem("db_" + sciezka);
      return dane ? JSON.parse(dane) : pobierzPrzykładoweDaneOffline(sciezka);
    } catch (e) {
      console.error("❌ [Offline] Błąd czytania z LocalStorage:", e);
      return null;
    }
  }
}

/**
 * 👀 OBSERWOWANIE ZMIAN W CZASIE RZECZYWISTYM
 * 
 * @param {string} sciezka - ścieżka do obserwowania
 * @param {function} callback - funkcja do wywołania przy zmianie danych
 */
export function obserwujDane(sciezka, callback) {
  if (isFirebaseConfigured) {
    try {
      return onValue(ref(database, sciezka), (snapshot) => {
        callback(snapshot.exists() ? snapshot.val() : null);
      });
    } catch (blad) {
      console.error("❌ [Firebase] Błąd obserwowania:", blad);
    }
  } else {
    // Tryb offline
    // Wywołaj callback od razu z obecnymi danymi
    czytajDane(sciezka).then(dane => callback(dane));
    
    // Zarejestruj nasłuchiwanie na zmiany lokalne
    const handler = (e) => {
      if (e.detail.sciezka === sciezka || e.detail.sciezka.startsWith(sciezka + "/")) {
        czytajDane(sciezka).then(noweDane => callback(noweDane));
      }
    };
    window.addEventListener("localstorage_change", handler);
    
    // Zwróć funkcję odsubskrybowania
    return () => {
      window.removeEventListener("localstorage_change", handler);
    };
  }
}

/**
 * ✏️ AKTUALIZOWANIE DANYCH
 */
export async function aktualizujDane(sciezka, dane) {
  if (isFirebaseConfigured) {
    try {
      await update(ref(database, sciezka), dane);
      return true;
    } catch (blad) {
      console.error("❌ [Firebase] Błąd aktualizacji:", blad);
      return false;
    }
  } else {
    // Tryb offline
    try {
      const aktualne = await czytajDane(sciezka) || {};
      const zaktualizowane = { ...aktualne, ...dane };
      await zapiszDane(sciezka, zaktualizowane);
      return true;
    } catch (e) {
      console.error("❌ [Offline] Błąd aktualizacji:", e);
      return false;
    }
  }
}

/**
 * 🗑️ USUWANIE DANYCH
 */
export async function usunDane(sciezka) {
  if (isFirebaseConfigured) {
    try {
      await remove(ref(database, sciezka));
      return true;
    } catch (blad) {
      console.error("❌ [Firebase] Błąd usuwania:", blad);
      return false;
    }
  } else {
    // Tryb offline
    try {
      localStorage.removeItem("db_" + sciezka);
      window.dispatchEvent(new CustomEvent("localstorage_change", { detail: { sciezka, dane: null } }));
      return true;
    } catch (e) {
      console.error("❌ [Offline] Błąd usuwania:", e);
      return false;
    }
  }
}

/**
 * 👤 REJESTRACJA NOWEGO UŻYTKOWNIKA
 */
export async function zarejestrajUzytkownika(email, haslo) {
  if (isFirebaseConfigured) {
    try {
      // 1. Utwórz konto w Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, haslo);
      console.log("✅ [Firebase] Zarejestrowano użytkownika:", result.user.uid);
      
      // 2. 🔥 ZAPISZ DO REALTIME DATABASE
      await set(ref(database, 'uzytkownicy/' + result.user.uid), {
          email: email,
          rola: "user",
          status: "Aktywny",
          createdAt: new Date().toISOString()
      });
      console.log("✅ [Firebase] Zapisano w Realtime Database");
      
      return result.user;
      
    } catch (blad) {
      console.error("❌ [Firebase] Błąd rejestracji:", blad);
      throw blad;
    }
  } else {
    // Tryb offline
    try {
      const usersJson = localStorage.getItem("mock_users");
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      const istnieje = users.find(u => u.email === email);
      if (istnieje) {
        throw new Error("auth/email-already-in-use");
      }
      
      const nowyUzytkownik = {
        uid: "mock_uid_" + Date.now(),
        email: email,
        rola: "user",           // 🔥 DODAJ ROLĘ
        status: "Aktywny",      // 🔥 DODAJ STATUS
        haslo: haslo
      };
      
      users.push(nowyUzytkownik);
      localStorage.setItem("mock_users", JSON.stringify(users));
      console.log("✅ [Offline] Zarejestrowano pomyślnie:", nowyUzytkownik.uid);
      return nowyUzytkownik;
    } catch (e) {
      console.error("❌ [Offline] Błąd rejestracji:", e);
      throw e;
    }
  }
}

/**
 * 🔓 LOGOWANIE UŻYTKOWNIKA
 */
export async function zalogujUzytkownika(email, haslo) {
  if (isFirebaseConfigured) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, haslo);
      console.log("✅ [Firebase] Zalogowano użytkownika:", result.user.uid);
      return result.user;
    } catch (blad) {
      console.error("❌ [Firebase] Błąd logowania:", blad);
      return null;
    }
  } else {
    // Tryb offline
    try {
      const usersJson = localStorage.getItem("mock_users");
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      const uzytkownik = users.find(u => u.email === email && u.haslo === haslo);
      
      if (uzytkownik) {
        const sesja = { uid: uzytkownik.uid, email: uzytkownik.email };
        localStorage.setItem("dashboard_active_user", JSON.stringify(sesja));
        powiadomSluchaczyAuth(sesja);
        console.log("✅ [Offline] Logowanie udane:", sesja.uid);
        return sesja;
      } else {
        console.warn("❌ [Offline] Błędne dane logowania");
        return null;
      }
    } catch (e) {
      console.error("❌ [Offline] Błąd logowania:", e);
      return null;
    }
  }
}

/**
 * 🚪 WYLOGOWANIE UŻYTKOWNIKA
 */
export async function wylogujUzytkownika() {
  if (isFirebaseConfigured) {
    try {
      await signOut(auth);
      console.log("✅ [Firebase] Wylogowano pomyślnie!");
      return true;
    } catch (blad) {
      console.error("❌ [Firebase] Błąd wylogowania:", blad);
      return false;
    }
  } else {
    // Tryb offline
    try {
      localStorage.removeItem("dashboard_active_user");
      powiadomSluchaczyAuth(null);
      console.log("✅ [Offline] Wylogowano pomyślnie!");
      return true;
    } catch (e) {
      console.error("❌ [Offline] Błąd wylogowania:", e);
      return false;
    }
  }
}

/**
 * Pomocnicza funkcja ładująca domyślne dane do tabeli jeśli baza/LocalStorage jest pusta.
 */
function pobierzPrzykładoweDaneOffline(sciezka) {
  if (sciezka === "zdarzenia") {
    const defaultData = {
      "zdarzenie1": {
        "uzytkownik": "Jan Kowalski",
        "data": "17 Gru 2025",
        "akcja": "Logowanie",
        "status": "Sukces"
      },
      "zdarzenie2": {
        "uzytkownik": "Anna Nowak",
        "data": "17 Gru 2025",
        "akcja": "Zmiana hasła",
        "status": "Oczekuje"
      },
      "zdarzenie3": {
        "uzytkownik": "Piotr Zieliński",
        "data": "16 Gru 2025",
        "akcja": "Błąd płatności",
        "status": "Błąd"
      },
      "zdarzenie4": {
        "uzytkownik": "Maria Wiśniewska",
        "data": "16 Gru 2025",
        "akcja": "Wylogowanie",
        "status": "Sukces"
      }
    };
    localStorage.setItem("db_zdarzenia", JSON.stringify(defaultData));
    return defaultData;
  }
  return null;
}
