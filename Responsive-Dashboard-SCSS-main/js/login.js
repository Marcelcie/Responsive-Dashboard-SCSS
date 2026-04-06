/**
 * 🔐 SYSTEM LOGOWANIA Z FIREBASE
 * 
 * Plik obsługuje logowanie użytkowników
 * Kod jest prosty - każdy krok ma objaśnienie
 */

import { zalogujUzytkownika, zarejestrajUzytkownika } from "./firebase-helpers.js";

/**
 * Gdy strona się załaduje, szukamy formularzy
 * DOMContentLoaded - oznacza "gdy HTML się całkowicie załadował"
 */
document.addEventListener('DOMContentLoaded', () => {
  // Szukamy formularza logowania
  const loginForm = document.getElementById('loginForm');
  
  // Jeśli formularz istnieje, dodajemy mu funkcję
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

/**
 * 📝 OBSŁUGA LOGOWANIA
 * 
 * Ta funkcja jest wywoływana, gdy użytkownik kliknie "Zaloguj się"
 * 
 * @param {event} e - zdarzenie kliknięcia
 */
async function handleLogin(e) {
  // e.preventDefault() - zapobiega odświeżaniu strony
  e.preventDefault();
  
  // Pobieramy wartości z pól formularza
  // element #emailInput to pole "Email"
  // element #passwordInput to pole "Hasło"
  const email = document.getElementById('emailInput').value;
  const haslo = document.getElementById('passwordInput').value;
  
  // Sprawdzamy, czy pola nie są puste
  if (!email || !haslo) {
    alert('❌ Podaj email i hasło!');
    return;
  }
  
  console.log("🔄 Próbuję zalogować:", email);
  
  // Wywoływamy funkcję z firebase-helpers.js
  // Czekamy na odpowiedź z Firebase (await)
  const uzytkownik = await zalogujUzytkownika(email, haslo);
  
  // Sprawdzamy, czy logowanie się udało
  if (uzytkownik) {
    console.log("✅ Logowanie udane! UID:", uzytkownik.uid);
    // Przenosimy do dashboarda
    window.location.href = 'index.html';
  } else {
    console.log("❌ Logowanie nie udało się");
    alert('❌ Błędny email lub hasło!');
  }
}

/**
 * 📝 OBSŁUGA REJESTRACJI
 * 
 * Opcjonalnie - jeśli chcesz umożliwić rejestrację
 * 
 * @param {event} e - zdarzenie kliknięcia
 */
async function handleRegister(e) {
  e.preventDefault();
  
  const email = document.getElementById('emailInput').value;
  const haslo = document.getElementById('passwordInput').value;
  
  if (!email || !haslo) {
    alert('❌ Podaj email i hasło!');
    return;
  }
  
  // Minimum 6 znaków hasła
  if (haslo.length < 6) {
    alert('❌ Hasło musi mieć co najmniej 6 znaków!');
    return;
  }
  
  console.log("🔄 Rejestruję użytkownika:", email);
  
  const uzytkownik = await zarejestrajUzytkownika(email, haslo);
  
  if (uzytkownik) {
    alert('✅ Rejestracja udana! Teraz się zaloguj.');
    window.location.href = 'login.html';
  } else {
    alert('❌ Rejestracja nie udała się (być może email już istnieje)');
  }
}
