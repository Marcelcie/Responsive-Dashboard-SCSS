import { 
    sprawdzStanAutoryzacji, 
    wylogujUzytkownika, 
    obserwujDane, 
    zapiszDane 
} from "./firebase-helpers.js";

// Zmienna przechowująca referencję do wykresu i zalogowanego użytkownika
let myChart = null;
let zalogowanyUzytkownik = null;

// --- 1. SZYBKIE ZABEZPIECZENIE STRONY (AUTH GUARD) ---
sprawdzStanAutoryzacji((uzytkownik) => {
    if (!uzytkownik) {
        console.log("ℹ️ Użytkownik niezalogowany. Przekierowuję do login.html...");
        window.location.href = 'login.html';
    } else {
        zalogowanyUzytkownik = uzytkownik;
        console.log("✅ Zalogowano jako:", uzytkownik.email);
        
        // Zaktualizuj wyświetlanie e-maila w nagłówku
        const emailDisplay = document.getElementById('user-email-display');
        if (emailDisplay) {
            emailDisplay.textContent = uzytkownik.email;
        }
        
        // Rozpocznij nasłuchiwanie zdarzeń w czasie rzeczywistym
        uruchomRealtimeDashboard();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // --- 2. LOGIKA MOTYWU CIEMNEGO ---
    inicjalizujMotyw();

    // --- 3. OBSŁUGA PRZYCISKU WYLOGOWANIA ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log("🔄 Wylogowywanie...");
            const sukces = await wylogujUzytkownika();
            if (sukces) {
                window.location.href = 'login.html';
            }
        });
    }

    // --- 4. OBSŁUGA OKNA MODALNEGO (NOWE ZDARZENIE) ---
    inicjalizujModal();
});

/**
 * Obsługuje wczytywanie i przełączanie jasnego/ciemnego motywu.
 */
function inicjalizujMotyw() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Pobierz zapisany motyw z LocalStorage
    const zapisanyMotyw = localStorage.getItem('theme') || 'light';
    
    // Zastosuj motyw na starcie
    if (zapisanyMotyw === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        document.body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
    }

    // Obsługa kliknięcia w przycisk motywu
    themeToggle.addEventListener('click', () => {
        const obecnyMotyw = document.body.getAttribute('data-theme');
        
        if (obecnyMotyw === 'dark') {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '🌙';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️';
        }
        
        // Zaktualizuj kolory wykresu (jeśli jest zainicjalizowany)
        zaktualizujStylWykresu();
    });
}

/**
 * Obsługuje modal dodawania zdarzenia.
 */
function inicjalizujModal() {
    const modal = document.getElementById('addEventModal');
    const addBtn = document.getElementById('addEventBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const addEventForm = document.getElementById('addEventForm');
    const eventUserField = document.getElementById('eventUser');

    if (!modal) return;

    // Otwórz modal
    addBtn.addEventListener('click', () => {
        if (zalogowanyUzytkownik) {
            eventUserField.value = zalogowanyUzytkownik.email;
        }
        modal.classList.add('active');
    });

    // Zamknij modal (krzyżyk)
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Zamknij modal (anuluj)
    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Zamknij modal po kliknięciu poza okno
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Wysłanie formularza
    addEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const akcja = document.getElementById('eventAction').value;
        const status = document.getElementById('eventStatus').value;
        
        if (!akcja || !status) return;

        // Generuj czytelną datę w języku polskim
        const teraz = new Date();
        const dataSformatowana = teraz.toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        const noweZdarzenie = {
            uzytkownik: eventUserField.value,
            data: dataSformatowana,
            akcja: akcja,
            status: status,
            timestamp: teraz.getTime() // Przydatne do sortowania i wykresu
        };

        // Unikalny identyfikator zdarzenia na podstawie czasu
        const idZdarzenia = "zdarzenie_" + teraz.getTime();

        console.log("🔄 Zapisuję nowe zdarzenie:", noweZdarzenie);
        
        const sukces = await zapiszDane("zdarzenia/" + idZdarzenia, noweZdarzenie);
        
        if (sukces) {
            modal.classList.remove('active');
            addEventForm.reset();
        } else {
            alert("❌ Nie udało się zapisać zdarzenia. Spróbuj ponownie.");
        }
    });
}

/**
 * Uruchamia obserwację danych w bazie (Firebase / LocalStorage)
 * i aktualizuje interfejs w czasie rzeczywistym.
 */
function uruchomRealtimeDashboard() {
    obserwujDane("zdarzenia", (dane) => {
        console.log("📊 Dane zaktualizowane na dashboardzie:", dane);
        
        // 1. Zbuduj listę zdarzeń (posortowaną od najnowszych)
        const listaZdarzen = [];
        if (dane) {
            Object.keys(dane).forEach(klucz => {
                const item = dane[klucz];
                listaZdarzen.push({
                    id: klucz,
                    ...item,
                    // Dodaj timestamp pomocniczy jeśli go nie ma
                    timestamp: item.timestamp || wyliczTimestampZDaty(item.data)
                });
            });
        }
        
        // Sortowanie po timestampie malejąco
        listaZdarzen.sort((a, b) => b.timestamp - a.timestamp);

        // 2. Wyrenderuj tabelę
        renderujTabeleZdarzen(listaZdarzen);

        // 3. Zaktualizuj karty statystyk
        zaktualizujKartyStatystyk(listaZdarzen);

        // 4. Zaktualizuj/Zainicjalizuj wykres aktywności
        renderujLubAktualizujWykres(listaZdarzen);
    });
}

/**
 * Renderuje wiersze tabeli zdarzeń.
 */
function renderujTabeleZdarzen(zdarzenia) {
    const tbody = document.getElementById('eventsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (zdarzenia.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--text-light);">Brak zarejestrowanych zdarzeń</td></tr>`;
        return;
    }

    zdarzenia.forEach(item => {
        const tr = document.createElement('tr');
        
        // Dopasowanie klasy badge do statusu
        let badgeClass = 'success';
        if (item.status === 'Oczekuje') badgeClass = 'warning';
        if (item.status === 'Błąd') badgeClass = 'danger';

        tr.innerHTML = `
            <td>${escapeHTML(item.uzytkownik)}</td>
            <td>${escapeHTML(item.data)}</td>
            <td>${escapeHTML(item.akcja)}</td>
            <td><span class="badge ${badgeClass}">${escapeHTML(item.status)}</span></td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Aktualizuje wartości na trzech kartach podglądu.
 */
function zaktualizujKartyStatystyk(zdarzenia) {
    const usersCountEl = document.getElementById('stats-users-count');
    const eventsCountEl = document.getElementById('stats-events-count');
    const errorsCountEl = document.getElementById('stats-errors-count');

    // Liczba użytkowników (odczytujemy zarejestrowanych z LocalStorage + stały offset)
    if (usersCountEl) {
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const totalUsers = 1240 + mockUsers.length;
        usersCountEl.textContent = totalUsers.toLocaleString();
    }

    // Liczba zdarzeń (rozmiar tabeli)
    if (eventsCountEl) {
        eventsCountEl.textContent = zdarzenia.length;
    }

    // Liczba błędów
    if (errorsCountEl) {
        const bledyCount = zdarzenia.filter(z => z.status === 'Błąd').length;
        errorsCountEl.textContent = bledyCount;
        
        // Jeśli są błędy, zmień kolor opisu na czerwony
        const trendEl = document.getElementById('stats-errors-trend');
        if (trendEl) {
            if (bledyCount > 0) {
                trendEl.style.color = '#e74c3c';
            } else {
                trendEl.style.color = 'var(--text-light)';
            }
        }
    }
}

/**
 * Rysuje wykres aktywności lub aktualizuje dane na istniejącym wykresie.
 */
function renderujLubAktualizujWykres(zdarzenia) {
    const chartCanvas = document.getElementById('userTrendChart');
    if (!chartCanvas) return;

    // Przeliczenie aktywności dla każdego dnia tygodnia (Pn-Nd)
    const dniTygodnia = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
    const aktywnosc = [0, 0, 0, 0, 0, 0, 0]; // Licznik zdarzeń

    // Domyślne wartości startowe (jeśli baza jest mała, uzupełniamy tło dla realizmu)
    const defaultData = [12, 19, 15, 25, 22, 30, 28];

    // Zlicz zdarzenia na podstawie ich daty lub dnia tygodnia
    zdarzenia.forEach(z => {
        const dataZdarzenia = new Date(z.timestamp);
        // getDay() zwraca 0 dla Niedzieli, 1 dla Poniedziałku...
        let indexDnia = dataZdarzenia.getDay() - 1; // Przesuwamy, by Pn było 0
        if (indexDnia === -1) indexDnia = 6; // Niedziela ląduje na indeksie 6
        
        if (indexDnia >= 0 && indexDnia < 7) {
            aktywosc[indexDnia]++;
        }
    });

    // Sumujemy z domyślnym wzorcem, aby wykres zawsze wyglądał na bogaty w dane
    const chartDataValues = dniTygodnia.map((d, idx) => defaultData[idx] + aktywnosc[idx]);

    // Pobierz kolory zależnie od motywu
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? '#333333' : '#E0E0E0';
    const textColor = isDark ? '#ecf0f1' : '#333333';

    if (myChart) {
        // Wykres już istnieje - tylko aktualizujemy dane i opcje kolorystyczne
        myChart.data.datasets[0].data = chartDataValues;
        myChart.options.scales.x.grid.color = gridColor;
        myChart.options.scales.y.grid.color = gridColor;
        myChart.options.scales.x.ticks.color = textColor;
        myChart.options.scales.y.ticks.color = textColor;
        myChart.update();
    } else {
        // Pierwsze rysowanie wykresu
        const ctx = chartCanvas.getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dniTygodnia,
                datasets: [{
                    label: 'Zarejestrowane Akcje',
                    data: chartDataValues,
                    borderColor: '#0078D4',
                    backgroundColor: 'rgba(0, 120, 212, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // Ukrywamy legendę dla minimalizmu
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor },
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

/**
 * Zmienia kolory siatki i etykiet wykresu przy przełączaniu motywu.
 */
function zaktualizujStylWykresu() {
    if (!myChart) return;
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? '#333333' : '#E0E0E0';
    const textColor = isDark ? '#ecf0f1' : '#333333';

    myChart.options.scales.x.grid.color = gridColor;
    myChart.options.scales.y.grid.color = gridColor;
    myChart.options.scales.x.ticks.color = textColor;
    myChart.options.scales.y.ticks.color = textColor;
    myChart.update();
}

// --- FUNKCJE POMOCNICZE ---

/**
 * Próbuje parsować datę tekstową np. "17 Gru 2025" na milisekundy.
 * Jeśli nie potrafi, zwraca obecny czas.
 */
function wyliczTimestampZDaty(dataStr) {
    if (!dataStr) return Date.now();
    try {
        const parts = dataStr.split(' ');
        if (parts.length >= 3) {
            const dzien = parseInt(parts[0]);
            const rok = parseInt(parts[2]);
            const miesiace = {
                'sty': 0, 'lut': 1, 'mar': 2, 'kwi': 3, 'maj': 4, 'cze': 5,
                'lip': 6, 'sie': 7, 'wrz': 8, 'paź': 9, 'lis': 10, 'gru': 11
            };
            const skrotMiesiaca = parts[1].toLowerCase().substring(0, 3);
            const miesiac = miesiace[skrotMiesiaca] !== undefined ? miesiace[skrotMiesiaca] : 0;
            return new Date(rok, miesiac, dzien).getTime();
        }
    } catch (e) {
        console.warn("Błąd parsowania daty:", dataStr, e);
    }
    return Date.now();
}

/**
 * Bezpieczne kodowanie znaków specjalnych HTML, zapobiega atakom XSS.
 */
function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}