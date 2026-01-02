//wykres (canva)

document.addEventListener('DOMContentLoaded', () => {
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
});