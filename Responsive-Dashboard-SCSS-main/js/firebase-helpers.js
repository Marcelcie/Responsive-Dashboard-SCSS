/**
 * 🛠️ FUNKCJE POMOCNICZE FIREBASE
 * 
 * Tu są funkcje, które ułatwiają pracę z bazą danych.
 * Każda funkcja ma jasne wyjaśnienie co robi.
 */

import { 
  ref,                    // tworzy referencję do ścieżki w bazie
  set,                    // zapisuje dane
  get,                    // czyta dane
  update,                 // aktualizuje dane
  remove,                 // usuwa dane
  onValue,                // obserwuje zmiany w czasie rzeczywistym
  query,
  orderByChild,
  limitToFirst
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

import {
  createUserWithEmailAndPassword,  // rejestracja nowego użytkownika
  signInWithEmailAndPassword,      // logowanie
  signOut                          // wylogowanie
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import { database, auth } from "./firebase-config.js";

/**
 * ✍️ ZAPISYWANIE DANYCH
 * 
 * @param {string} sciezka - gdzie w bazie zapisać (np. "uzytkownicy/user1")
 * @param {object} dane - co zapisać (np. {imie: "Jan", nazwisko: "Kowalski"})
 * 
 * PRZYKŁAD UŻYCIA:
 * zapiszDane("uzytkownicy/user1", {imie: "Jan", nazwisko: "Kowalski"})
 */
export async function zapiszDane(sciezka, dane) {
  try {
    // ref() - tworzy ścieżkę do bazy "uzytkownicy/user1"
    // set() - zapisuje tam dane
    await set(ref(database, sciezka), dane);
    console.log("✅ Dane zapisane pomyślnie!");
    return true;
  } catch (blad) {
    console.error("❌ Błąd przy zapisywaniu:", blad);
    return false;
  }
}

/**
 * 📖 CZYTANIE JEDNORAZOWE
 * 
 * Pobiera dane raz z bazy (nie obserwuje zmian)
 * 
 * @param {string} sciezka - ścieżka do danych
 * @returns {object} - pobrane dane
 * 
 * PRZYKŁAD:
 * const dane = await czytajDane("uzytkownicy/user1")
 * console.log(dane) // {imie: "Jan", nazwisko: "Kowalski"}
 */
export async function czytajDane(sciezka) {
  try {
    // ref() - wskazuje gdzie czytać
    // get() - pobiera dane raz
    // .val() - wyodrębnia wartość
    const snapshot = await get(ref(database, sciezka));
    
    if (snapshot.exists()) {
      console.log("✅ Dane pobrane:", snapshot.val());
      return snapshot.val();
    } else {
      console.log("⚠️ Brak danych na tej ścieżce");
      return null;
    }
  } catch (blad) {
    console.error("❌ Błąd przy czytaniu:", blad);
    return null;
  }
}

/**
 * 👀 OBSERWOWANIE ZMIAN W CZASIE RZECZYWISTYM
 * 
 * Ta funkcja "słucha" zmian w bazie
 * Gdy ktoś zmieni dane, automatycznie Ci powie
 * 
 * @param {string} sciezka - gdzie obserwować
 * @param {function} callback - co zrobić gdy zmienią się dane
 * 
 * PRZYKŁAD:
 * obserwujDane("uzytkownicy", (dane) => {
 *   console.log("Są nowe dane!", dane)
 * })
 */
export function obserwujDane(sciezka, callback) {
  try {
    // ref() - wskazuje gdzie obserwować
    // onValue() - funkcja, która reaguje na zmianę
    onValue(ref(database, sciezka), (snapshot) => {
      if (snapshot.exists()) {
        console.log("👀 Nowe dane z bazy:", snapshot.val());
        // callback() - to Twoja funkcja, wywoływana przy zmianie
        callback(snapshot.val());
      }
    });
  } catch (blad) {
    console.error("❌ Błąd przy obserwowaniu:", blad);
  }
}

/**
 * ✏️ AKTUALIZOWANIE DANYCH
 * 
 * Zmienia tylko wybrany kawałek danych, nie nadpisuje wszystkiego
 * 
 * @param {string} sciezka - gdzie aktualizować
 * @param {object} dane - co zmienić
 * 
 * PRZYKŁAD:
 * aktualizujDane("uzytkownicy/user1", {imie: "Janusz"})
 * // imię się zmieni, ale nazwisko zostanie takie samo
 */
export async function aktualizujDane(sciezka, dane) {
  try {
    await update(ref(database, sciezka), dane);
    console.log("✅ Dane zaktualizowane!");
    return true;
  } catch (blad) {
    console.error("❌ Błąd przy aktualizowaniu:", blad);
    return false;
  }
}

/**
 * 🗑️ USUWANIE DANYCH
 * 
 * Kasuje dane z bazy
 * 
 * @param {string} sciezka - co usunąć
 * 
 * PRZYKŁAD:
 * usunDane("uzytkownicy/user1")
 * // Użytkownik user1 zostanie usunięty
 */
export async function usunDane(sciezka) {
  try {
    await remove(ref(database, sciezka));
    console.log("✅ Dane usunięte!");
    return true;
  } catch (blad) {
    console.error("❌ Błąd przy usuwaniu:", blad);
    return false;
  }
}

/**
 * 👤 REJESTRACJA NOWEGO UŻYTKOWNIKA
 * 
 * Tworzy nowe konto
 * 
 * @param {string} email - email użytkownika
 * @param {string} haslo - hasło (minimum 6 znaków)
 * @returns {object} - dane nowego użytkownika
 * 
 * PRZYKŁAD:
 * const uzytkownik = await zarejestrajUzytkownika("jan@gmail.com", "haslo123")
 */
export async function zarejestrajUzytkownika(email, haslo) {
  try {
    // createUserWithEmailAndPassword() - tworzy nowe konto
    const result = await createUserWithEmailAndPassword(auth, email, haslo);
    console.log("✅ Użytkownik zarejestrowany:", result.user.uid);
    return result.user;
  } catch (blad) {
    console.error("❌ Błąd rejestracji:", blad);
    return null;
  }
}

/**
 * 🔓 LOGOWANIE UŻYTKOWNIKA
 * 
 * Zalogowuje istniejącego użytkownika
 * 
 * @param {string} email - email
 * @param {string} haslo - hasło
 * @returns {object} - dane zalogowanego użytkownika
 * 
 * PRZYKŁAD:
 * const uzytkownik = await zalogujUzytkownika("jan@gmail.com", "haslo123")
 */
export async function zalogujUzytkownika(email, haslo) {
  try {
    // signInWithEmailAndPassword() - loguje użytkownika
    const result = await signInWithEmailAndPassword(auth, email, haslo);
    console.log("✅ Zalogowano:", result.user.uid);
    return result.user;
  } catch (blad) {
    console.error("❌ Błąd logowania:", blad);
    return null;
  }
}

/**
 * 🚪 WYLOGOWANIE UŻYTKOWNIKA
 * 
 * PRZYKŁAD:
 * await wylogujUzytkownika()
 */
export async function wylogujUzytkownika() {
  try {
    await signOut(auth);
    console.log("✅ Wylogowano pomyślnie!");
    return true;
  } catch (blad) {
    console.error("❌ Błąd wylogowania:", blad);
    return false;
  }
}
