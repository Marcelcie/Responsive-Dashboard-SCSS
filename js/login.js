/**
 * 🔐 SYSTEM AUTORYZACJI (LOGOWANIE I REJESTRACJA)
 * 
 * Ten plik obsługuje logowanie oraz rejestrację użytkowników.
 * Posiada dodatkowe ułatwienia, takie jak pokazywanie hasła.
 */

import { zalogujUzytkownika, zarejestrajUzytkownika, pokazToast } from "./firebase-helpers.js";

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
  
    // 🔥 DODAJ OBSŁUGĘ WSKAŹNIKA SIŁY HASŁA
    const passwordInput = document.getElementById('passwordInput');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (passwordInput && strengthFill && strengthText) {
        passwordInput.addEventListener('input', () => {
            const haslo = passwordInput.value;
            const sila = sprawdzSileHasla(haslo);
            aktualizujWskaznikSily(sila, strengthFill, strengthText);
        });
    }

/**
 * 🔒 Sprawdza siłę hasła
 * Zwraca: 0 (puste), 1 (słabe), 2 (średnie), 3 (mocne)
 */
function sprawdzSileHasla(haslo) {
    if (!haslo) return 0;
    
    let punkty = 0;
    
    // Długość
    if (haslo.length >= 6) punkty++;
    if (haslo.length >= 10) punkty++;
    
    // Wielkie litery
    if (/[A-Z]/.test(haslo)) punkty++;
    
    // Małe litery
    if (/[a-z]/.test(haslo)) punkty++;
    
    // Cyfry
    if (/[0-9]/.test(haslo)) punkty++;
    
    // Znaki specjalne
    if (/[!@#$%^&*(),.?":{}|<>]/.test(haslo)) punkty++;
    
    // Wynik
    if (punkty <= 2) return 1;      // słabe
    if (punkty <= 4) return 2;      // średnie
    return 3;                        // mocne
}

/**
 * 🎨 Aktualizuje wygląd wskaźnika
 */
function aktualizujWskaznikSily(sila, fillEl, textEl) {
    // Usuń wszystkie klasy
    fillEl.classList.remove('slabe', 'srednie', 'mocne');
    textEl.classList.remove('slabe', 'srednie', 'mocne');
    
    switch(sila) {
        case 0: // puste
            fillEl.style.width = '0%';
            fillEl.style.backgroundColor = 'transparent';
            textEl.textContent = 'Siła hasła';
            textEl.style.color = '#888';
            break;
            
        case 1: // słabe
            fillEl.classList.add('slabe');
            textEl.classList.add('slabe');
            textEl.textContent = 'Słabe hasło';
            break;
            
        case 2: // średnie
            fillEl.classList.add('srednie');
            textEl.classList.add('srednie');
            textEl.textContent = 'Średnie hasło';
            break;
            
        case 3: // mocne
            fillEl.classList.add('mocne');
            textEl.classList.add('mocne');
            textEl.textContent = 'Mocne hasło! ✅';
            break;
    }
}

/**
 * 📝 OBSŁUGA LOGOWANIA
 */
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('emailInput').value.trim();
  const haslo = document.getElementById('passwordInput').value;
  
  if (!email || !haslo) {
    pokazToast('❌ Podaj e-mail i hasło!','error');
    return;
  }
  
  console.log("🔄 Próba logowania użytkownika:", email);
  
  try {
    const uzytkownik = await zalogujUzytkownika(email, haslo);
    
    if (uzytkownik) {
      console.log("✅ Zalogowano pomyślnie! UID:", uzytkownik.uid);
      window.location.href = 'index.html';
    }
  } catch (error) {
    pokazToast('❌ Nieprawidłowy e-mail lub hasło.','error');
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
    pokazToast('❌ Wypełnij wszystkie pola formularza!','error');
    return;
  }
  
  if (haslo !== hasloPotwierdzenie) {
    pokazToast('❌ Hasła nie są identyczne!','error');
    return;
  }
  
  if (haslo.length < 6) {
    pokazToast('❌ Hasło musi składać się z co najmniej 6 znaków!','error');
    return;
  }
  
  console.log("🔄 Próba rejestracji nowego użytkownika:", email);
  
  try {
    const uzytkownik = await zarejestrajUzytkownika(email, haslo);
    
    if (uzytkownik) {
      pokazToast('✅ Rejestracja zakończona sukcesem! Możesz się teraz zalogować.');
      window.location.href = 'login.html';
    } else {
      pokazToast('❌ Rejestracja nie powiodła się.');
    }
    
    } catch (error) {
        console.error("❌ Błąd rejestracji:", error);
        
        // 🔥 Firebase zwraca kod błędu w error.code
        if (error.code === "auth/email-already-in-use") {
          pokazToast('❌ Ten adres e-mail jest już zarejestrowany!','error');
        } else if (error.code === "auth/weak-password") {
          pokazToast('❌ Hasło jest zbyt słabe! Minimum 6 znaków.','error');
        } else if (error.code === "auth/invalid-email") {
          pokazToast('❌ Nieprawidłowy format adresu e-mail.','error');
        } else {
          pokazToast('❌ Błąd podczas rejestracji: ','error');
        }
    }
}
