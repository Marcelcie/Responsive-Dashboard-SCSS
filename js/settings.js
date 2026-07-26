import { sprawdzStanAutoryzacji, wylogujUzytkownika, pokazToast, pobierzAktualnegoUzytkownika } from "./firebase-helpers.js";

// Zmienna dla zalogowanego użytkownika
let zalogowanyUzytkownik = null;

// --- AUTORYZACJA ---
sprawdzStanAutoryzacji((uzytkownik) => {
    if (!uzytkownik) {
        window.location.href = 'login.html';
    } else {
        zalogowanyUzytkownik = uzytkownik;
        document.getElementById('user-email-display').textContent = uzytkownik.email;
        // Wypełnij pole email w profilu
        const emailInput = document.getElementById('settings-email');
        if (emailInput) emailInput.value = uzytkownik.email;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // --- WYLOGOWANIE ---
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        const sukces = await wylogujUzytkownika();
        if (sukces) window.location.href = 'login.html';
    });

    // Dodatkowy przycisk "Usuń konto" w sekcji Usuwania konta
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (confirm('Czy na pewno chcesz usunąć swoje konto?')) {
                // Tutaj w przyszłości możesz dodać faktyczne żądanie usunięcia konta
                alert('Została wysłana prośba o usunięcie konta do administratora.', 'info');
            } else {
                pokazToast('Prośba o usunięcie konta została anulowana przez użytkownika.', 'info');
            }
        });
}

    // --- ZAPISZ PROFIL (przykład) ---
    const profileForm = document.getElementById('profile-settings-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('settings-name').value.trim();
            // Tutaj możesz zapisać dane do Firebase (np. aktualizacja w Realtime Database)
            pokazToast('Ustawienia profilu zapisane!', 'success');
        });
    }

    // --- ZMIANA HASŁA (przykładowy komunikat) ---
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            pokazToast('Funkcja zmiany hasła zostanie dodana wkrótce.', 'info');
        });
    }
});