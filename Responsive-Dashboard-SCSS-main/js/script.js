/**
 * 📊 DASHBOARD Z FIREBASE
 * 
 * Ten plik ładuje wykresy i dane z Firebase
 * Każdy kod jest wyjaśniony po polsku
 */

// Importujemy funkcje obsługi Firebase z pliku firebase-helpers.js
import { czytajDane, obserwujDane, wylogujUzytkownika } from "./firebase-helpers.js";

/**
 * 🚀 GŁÓWNA FUNKCJA
 * 
 * DOMContentLoaded - czeka aż strona się całkowicie załaduje
 * Wtedy uruchamia kod
 */
document.addEventListener('DOMContentLoaded', () => {
    // Pobieramy ostatnie zdarzenia z Firebase
    pobierzOstatniaZdarzenia();
    
    // Tworzymy wykres
    const chartCanvas = document.getElementById('userTrendChart');

    if (chartCanvas) {
        const ctx = chartCanvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'],
                datasets: [{
                    label: 'Aktywność',
                    data: [12, 19, 15, 25, 22, 30, 28],
                    borderColor: '#0078D4',
                    backgroundColor: 'rgba(0, 120, 212, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Obsługujemy wylogowanie
    observeLogoutButton();
});

/**
 * 📖 POBIERANIE OSTATNICH ZDARZEŃ Z FIREBASE
 * 
 * Ta funkcja:
 * 1. Łączy się z Firebase
 * 2. Pobiera dane z bazy
 * 3. Wstawia je do tabeli na stronie
 */
async function pobierzOstatniaZdarzenia() {
    try {
        console.log("🔄 Pobieram dane z Firebase...");
        
        // czytajDane() - funkcja z firebase-helpers.js
        // Pobiera dane z ścieżki "zdarzenia" (musisz tę ścieżkę stworzyć w Firebase)
        const zdarzenia = await czytajDane("zdarzenia");
        
        // Jeśli zdarzenia istnieją, wstawiamy je do tabeli
        if (zdarzenia) {
            console.log("✅ Pobrano zdarzenia:", zdarzenia);
            wyswietlZdarzenia(zdarzenia);
        } else {
            console.log("⚠️ Brak zdarzeń w bazie");
        }
    } catch (blad) {
        console.error("❌ Błąd przy pobieraniu zdarzeń:", blad);
    }
}

/**
 * 📋 WYŚWIETLANIE ZDARZEŃ W TABELI
 * 
 * Bierze dane z Firebase i wstawia je do tabeli HTML
 * 
 * @param {object} zdarzenia - dane z Firebase
 * 
 * Struktura danych powinna być taka:
 * {
 *   "zdarzenie1": {
 *     "uzytkownik": "Jan Kowalski",
 *     "data": "17 Gru 2025",
 *     "akcja": "Logowanie",
 *     "status": "Sukces"
 *   },
 *   "zdarzenie2": {...}
 * }
 */
function wyswietlZdarzenia(zdarzenia) {
    // Znajdujemy element tbody (ciało tabeli)
    const tbody = document.querySelector('table tbody');
    
    // Czyścimy starą zawartość
    tbody.innerHTML = '';
    
    // Przechodzmy przez każde zdarzenie
    Object.entries(zdarzenia).forEach(([klucz, zdarzenie]) => {
        // Tworzymy nowy wiersz (<tr>)
        const wiersz = document.createElement('tr');
        
        // Wstawiamy dane do wiersza
        // Każda kolumna to <td>
        wiersz.innerHTML = `
            <td>${zdarzenie.uzytkownik || 'Nieznany'}</td>
            <td>${zdarzenie.data || '-'}</td>
            <td>${zdarzenie.akcja || '-'}</td>
            <td><span class="badge ${getBadgeClass(zdarzenie.status)}">${zdarzenie.status || '-'}</span></td>
        `;
        
        // Dodajemy wiersz do tabeli
        tbody.appendChild(wiersz);
    });
    
    console.log("✅ Zaktualizowano tabelę!");
}

/**
 * 🎨 POMOCNA FUNKCJA - WYBÓR KOLORU BADGE'a
 * 
 * W zależności od statusu, wybieramy inny kolor
 * 
 * @param {string} status - status zdarzenia
 * @returns {string} - klasa CSS do stylizacji
 */
function getBadgeClass(status) {
    if (status === 'Sukces') return 'success';
    if (status === 'Oczekuje') return 'warning';
    if (status === 'Błąd') return 'danger';
    return 'info';
}

/**
 * 🚪 OBSŁUGA WYLOGOWANIA
 * 
 * Znajdujemy przycisk wylogowania i dodajemy mu funkcję
 */
function observeLogoutButton() {
    const logoutBtn = document.querySelector('.logout');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            console.log("🔄 Wyloguję użytkownika...");
            
            // Wywoływamy funkcję wylogowania z firebase-helpers.js
            const wynik = await wylogujUzytkownika();
            
            if (wynik) {
                console.log("✅ Pomyślnie wylogowano!");
                // Przenosimy do strony logowania
                window.location.href = 'login.html';
            }
        });
    }
}