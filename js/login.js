/**
 * 🔐 SYSTEM AUTORYZACJI (LOGOWANIE I REJESTRACJA)
 * 
 * Ten plik obsługuje logowanie oraz rejestrację użytkowników.
 * Posiada dodatkowe ułatwienia, takie jak pokazywanie hasła.
 */

import { zalogujUzytkownika, zarejestrajUzytkownika } from "./firebase-helpers.js";

document.addEventListener('DOMContentLoaded', () => {
  // 1. Szukamy formularza logowania
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // 2. Szukamy formularza rejestracji
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // 3. Obsługa przełącznika widoczności hasła (funkcja Premium UI)
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const passwordInput = document.getElementById('passwordInput');
  const passwordConfirmInput = document.getElementById('passwordConfirmInput');

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      if (passwordConfirmInput) {
        passwordConfirmInput.setAttribute('type', type);
      }

      // Zmiana ikonki z otwartego oka na zamknięte
      if (type === 'text') {
        togglePasswordBtn.classList.remove('fa-eye');
        togglePasswordBtn.classList.add('fa-eye-slash');
      } else {
        togglePasswordBtn.classList.remove('fa-eye-slash');
        togglePasswordBtn.classList.add('fa-eye');
      }
    });
  }
});

/**
 * 📝 OBSŁUGA LOGOWANIA
 */
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('emailInput').value.trim();
  const haslo = document.getElementById('passwordInput').value;
  
  if (!email || !haslo) {
    alert('❌ Podaj e-mail i hasło!');
    return;
  }
  
  console.log("🔄 Próba logowania użytkownika:", email);
  
  try {
    const uzytkownik = await zalogujUzytkownika(email, haslo);
    
    if (uzytkownik) {
      console.log("✅ Zalogowano pomyślnie! UID:", uzytkownik.uid);
      window.location.href = 'index.html';
    } else {
      alert('❌ Nieprawidłowy e-mail lub hasło.');
    }
  } catch (error) {
    console.error("❌ Błąd logowania:", error);
    alert('❌ Wystąpił błąd podczas logowania: ' + error.message);
  }
}

/**
 * 📝 OBSŁUGA REJESTRACJI
 */
async function handleRegister(e) {
  e.preventDefault();
  
  const email = document.getElementById('emailInput').value.trim();
  const haslo = document.getElementById('passwordInput').value;
  const hasloPotwierdzenie = document.getElementById('passwordConfirmInput').value;
  
  if (!email || !haslo || !hasloPotwierdzenie) {
    alert('❌ Wypełnij wszystkie pola formularza!');
    return;
  }
  
  if (haslo !== hasloPotwierdzenie) {
    alert('❌ Hasła nie są identyczne!');
    return;
  }
  
  if (haslo.length < 6) {
    alert('❌ Hasło musi składać się z co najmniej 6 znaków!');
    return;
  }
  
  console.log("🔄 Próba rejestracji nowego użytkownika:", email);
  
  try {
    const uzytkownik = await zarejestrajUzytkownika(email, haslo);
    
    if (uzytkownik) {
      alert('✅ Rejestracja zakończona sukcesem! Możesz się teraz zalogować.');
      window.location.href = 'login.html';
    } else {
      alert('❌ Rejestracja nie powiodła się.');
    }
  } catch (error) {
    console.error("❌ Błąd rejestracji:", error);
    if (error.message === "auth/email-already-in-use" || error.code === "auth/email-already-in-use") {
      alert('❌ Ten adres e-mail jest już zarejestrowany!');
    } else {
      alert('❌ Błąd podczas rejestracji: ' + error.message);
    }
  }
}
