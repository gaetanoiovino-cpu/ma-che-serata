/**
 * INVESTORS DASHBOARD
 * Dashboard per Analytics e Performance per Partner e Investitori
 */

class InvestorsDashboard {
    constructor() {
        this.currentPeriod = '7d';
        this.charts = {};
        this.data = {};
    }

    init() {
        this.loadMockData();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateKPIs();
        console.log('🔥 Investors Dashboard inizializzata');
    }

    loadMockData() {
        this.data = {
            '7d': {
                totalUsers: 12847,
                eventBookings: 3421,
                conversionRate: 67.8,
                soldOutEvents: 89,
                avgEngagement: 4.2,
                revenue: 84230,
                userGrowth: [
                    { date: '2024-01-08', users: 12000 },
                    { date: '2024-01-09', users: 12120 },
                    { date: '2024-01-10', users: 12350 },
                    { date: '2024-01-11', users: 12480 },
                    { date: '2024-01-12', users: 12650 },
                    { date: '2024-01-13', users: 12780 },
                    { date: '2024-01-14', users: 12847 }
                ],
                bookingsCategory: [
                    { category: 'Aperitivi', count: 1205 },
                    { category: 'Cene', count: 892 },
                    { category: 'Discoteca', count: 756 },
                    { category: 'Eventi Speciali', count: 568 }
                ],
                revenue: [
                    { date: '2024-01-08', amount: 78500 },
                    { date: '2024-01-09', amount: 79200 },
                    { date: '2024-01-10', amount: 80100 },
                    { date: '2024-01-11', amount: 81300 },
                    { date: '2024-01-12', amount: 82450 },
                    { date: '2024-01-13', users: 83600 },
                    { date: '2024-01-14', amount: 84230 }
                ]
            },
            '30d': {
                totalUsers: 45230,
                eventBookings: 12580,
                conversionRate: 72.1,
                soldOutEvents: 91,
                avgEngagement: 4.8,
                revenue: 320450
            },
            '90d': {
                totalUsers: 98750,
                eventBookings: 28900,
                conversionRate: 69.3,
                soldOutEvents: 87,
                avgEngagement: 4.5,
                revenue: 750280
            },
            '1y': {
                totalUsers: 156780,
                eventBookings: 89500,
                conversionRate: 65.2,
                soldOutEvents: 84,
                avgEngagement: 4.3,
                revenue: 2180500
            }
        };
    }

    setupEventListeners() {
        // Period selector buttons
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = e.target.dataset.period;
                this.updateDashboard();
            });
        });
    }

    updateDashboard() {
        this.updateKPIs();
        this.updateCharts();
        window.app.showToast(`📊 Dashboard aggiornata per periodo: ${this.formatPeriod(this.currentPeriod)}`, 'success');
    }

    formatPeriod(period) {
        const periods = {
            '7d': '7 Giorni',
            '30d': '30 Giorni',
            '90d': '3 Mesi',
            '1y': '1 Anno'
        };
        return periods[period] || period;
    }

    updateKPIs() {
        const data = this.data[this.currentPeriod];
        
        document.getElementById('totalUsers').textContent = this.formatNumber(data.totalUsers);
        document.getElementById('eventBookings').textContent = this.formatNumber(data.eventBookings);
        document.getElementById('conversionRate').textContent = `${data.conversionRate}%`;
        document.getElementById('soldOutEvents').textContent = `${data.soldOutEvents}%`;
        document.getElementById('avgEngagement').textContent = `${data.avgEngagement}min`;
        document.getElementById('revenue').textContent = `€${this.formatNumber(data.revenue)}`;
    }

    formatNumber(num) {
        return new Intl.NumberFormat('it-IT').format(num);
    }

    initializeCharts() {
        this.createUserGrowthChart();
        this.createBookingsCategoryChart();
        this.createRevenueChart();
        this.createConversionFunnelChart();
    }

    updateCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.initializeCharts();
    }

    createUserGrowthChart() {
        const ctx = document.getElementById('userGrowthChart').getContext('2d');
        const data = this.data[this.currentPeriod].userGrowth || [];
        
        this.charts.userGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => new Date(d.date).toLocaleDateString('it-IT')),
                datasets: [{
                    label: 'Utenti Totali',
                    data: data.map(d => d.users),
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: 'white' }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    }

    createBookingsCategoryChart() {
        const ctx = document.getElementById('bookingsCategoryChart').getContext('2d');
        const data = this.data[this.currentPeriod].bookingsCategory || [];
        
        this.charts.bookingsCategory = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.category),
                datasets: [{
                    data: data.map(d => d.count),
                    backgroundColor: [
                        '#ff6b6b',
                        '#4ecdc4',
                        '#45b7d1',
                        '#ffd700'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { 
                            color: 'white',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        const data = this.data[this.currentPeriod].revenue || [];
        
        this.charts.revenue = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => new Date(d.date).toLocaleDateString('it-IT')),
                datasets: [{
                    label: 'Revenue €',
                    data: data.map(d => d.amount),
                    backgroundColor: 'rgba(70, 130, 180, 0.8)',
                    borderColor: '#4682b4',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: 'white' }
                    }
                },
                scales: {
                    y: {
                        ticks: { 
                            color: 'white',
                            callback: function(value) {
                                return '€' + value.toLocaleString('it-IT');
                            }
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    }

    createConversionFunnelChart() {
        const ctx = document.getElementById('conversionFunnelChart').getContext('2d');
        
        const funnelData = [
            { stage: 'Visite', value: 100 },
            { stage: 'Registrazioni', value: 45 },
            { stage: 'Eventi Visualizzati', value: 38 },
            { stage: 'Prenotazioni', value: 28 }
        ];
        
        this.charts.conversionFunnel = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: funnelData.map(d => d.stage),
                datasets: [{
                    label: 'Conversion %',
                    data: funnelData.map(d => d.value),
                    backgroundColor: [
                        'rgba(255, 107, 107, 0.8)',
                        'rgba(78, 205, 196, 0.8)',
                        'rgba(69, 183, 209, 0.8)',
                        'rgba(255, 215, 0, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: 'white',
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    }

    // Export Functions
    exportPDF() {
        window.app.showToast('📄 Generando report PDF...', 'info');
        
        // Simulate PDF generation
        setTimeout(() => {
            const reportData = this.generateReportData();
            const pdfContent = this.generatePDFContent(reportData);
            
            // In a real implementation, you would use a library like jsPDF
            console.log('PDF Content:', pdfContent);
            
            window.app.showToast('📄 Report PDF generato con successo!', 'success');
            this.downloadFile('ma-che-serata-analytics.pdf', 'application/pdf');
        }, 2000);
    }

    exportExcel() {
        window.app.showToast('📊 Generando file Excel...', 'info');
        
        setTimeout(() => {
            const reportData = this.generateReportData();
            const excelData = this.generateExcelData(reportData);
            
            console.log('Excel Data:', excelData);
            
            window.app.showToast('📊 File Excel generato con successo!', 'success');
            this.downloadFile('ma-che-serata-data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }, 1500);
    }

    exportPowerPoint() {
        window.app.showToast('📋 Generando presentazione PowerPoint...', 'info');
        
        setTimeout(() => {
            const reportData = this.generateReportData();
            const pptContent = this.generatePowerPointContent(reportData);
            
            console.log('PowerPoint Content:', pptContent);
            
            window.app.showToast('📋 Presentazione PowerPoint generata con successo!', 'success');
            this.downloadFile('ma-che-serata-presentation.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        }, 3000);
    }

    shareReport() {
        const shareData = {
            title: 'Ma Che Serata - Analytics Report',
            text: `Report Analytics per periodo: ${this.formatPeriod(this.currentPeriod)}`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => window.app.showToast('🔗 Report condiviso con successo!', 'success'))
                .catch(() => this.fallbackShare(shareData));
        } else {
            this.fallbackShare(shareData);
        }
    }

    fallbackShare(shareData) {
        // Copy link to clipboard
        navigator.clipboard.writeText(shareData.url)
            .then(() => {
                window.app.showToast('🔗 Link copiato negli appunti!', 'success');
            })
            .catch(() => {
                window.app.showToast('❌ Errore nella condivisione', 'error');
            });
    }

    generateReportData() {
        const currentData = this.data[this.currentPeriod];
        
        return {
            period: this.formatPeriod(this.currentPeriod),
            generatedAt: new Date().toLocaleString('it-IT'),
            kpis: {
                totalUsers: currentData.totalUsers,
                eventBookings: currentData.eventBookings,
                conversionRate: currentData.conversionRate,
                soldOutEvents: currentData.soldOutEvents,
                avgEngagement: currentData.avgEngagement,
                revenue: currentData.revenue
            },
            insights: [
                'Crescita utenti del 23.5% rispetto al periodo precedente',
                'Conversion rate superiore del 60.3% rispetto alla media del settore',
                'Retention rate del 84.2% a 30 giorni',
                'Customer satisfaction: 4.8/5 stelle'
            ],
            recommendations: [
                'Focalizzarsi sulla categoria Aperitivi che mostra le migliori performance',
                'Investire in marketing per la zona Navigli (alta densità prenotazioni)',
                'Implementare programmi di fidelizzazione per aumentare il retention',
                'Espandere l\'offerta eventi speciali vista la crescente domanda'
            ]
        };
    }

    generatePDFContent(data) {
        return {
            title: 'Ma Che Serata - Analytics Report',
            subtitle: `Periodo: ${data.period}`,
            sections: [
                {
                    title: 'KPI Principali',
                    content: data.kpis
                },
                {
                    title: 'Insights Chiave',
                    content: data.insights
                },
                {
                    title: 'Raccomandazioni',
                    content: data.recommendations
                }
            ],
            footer: `Generato il ${data.generatedAt}`
        };
    }

    generateExcelData(data) {
        return {
            sheets: [
                {
                    name: 'KPI',
                    data: Object.entries(data.kpis).map(([key, value]) => ({
                        Metrica: key,
                        Valore: value,
                        Periodo: data.period
                    }))
                },
                {
                    name: 'User Growth',
                    data: this.data[this.currentPeriod].userGrowth || []
                },
                {
                    name: 'Bookings by Category',
                    data: this.data[this.currentPeriod].bookingsCategory || []
                }
            ]
        };
    }

    generatePowerPointContent(data) {
        return {
            slides: [
                {
                    title: 'Ma Che Serata Analytics',
                    subtitle: data.period,
                    content: 'Dashboard Performance Overview'
                },
                {
                    title: 'KPI Overview',
                    content: data.kpis
                },
                {
                    title: 'Key Insights',
                    content: data.insights
                },
                {
                    title: 'Recommendations',
                    content: data.recommendations
                }
            ]
        };
    }

    downloadFile(filename, mimeType) {
        // Simulate file download
        const blob = new Blob(['Mock file content'], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Global export functions for buttons
function exportPDF() {
    if (window.investorsDashboard) {
        window.investorsDashboard.exportPDF();
    }
}

function exportExcel() {
    if (window.investorsDashboard) {
        window.investorsDashboard.exportExcel();
    }
}

function exportPowerPoint() {
    if (window.investorsDashboard) {
        window.investorsDashboard.exportPowerPoint();
    }
}

function shareReport() {
    if (window.investorsDashboard) {
        window.investorsDashboard.shareReport();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.investorsDashboard = new InvestorsDashboard();
    window.investorsDashboard.init();
});