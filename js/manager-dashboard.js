class ManagerDashboard {
    constructor() {
        this.events = [];
        this.reservations = [];
        this.venueData = {};
        this.init();
    }

    init() {
        console.log('Manager Dashboard inizializzata');
        this.loadVenueData();
        this.loadEvents();
        this.loadReservations();
        this.setupEventListeners();
        this.startRealtimeUpdates();
    }

    async loadVenueData() {
        try {
            // Simuliamo il caricamento dei dati del locale
            this.venueData = {
                name: 'Club Elite',
                address: 'Via Roma 123, Milano',
                target: '25-35 anni',
                musicStyle: 'House/Techno',
                todayReservations: 156,
                averageOccupancy: 89,
                averageRating: 4.7,
                weeklyRevenue: 2840
            };
            
            this.updateVenueInfo();
            this.updateQuickStats();
        } catch (error) {
            console.error('Errore nel caricamento dati locale:', error);
        }
    }

    updateVenueInfo() {
        const venueName = document.getElementById('venueName');
        if (venueName) {
            venueName.textContent = this.venueData.name;
        }
    }

    updateQuickStats() {
        const stats = document.querySelectorAll('.stat-card h3');
        if (stats.length >= 4) {
            stats[0].textContent = this.venueData.todayReservations;
            stats[1].textContent = `${this.venueData.averageOccupancy}%`;
            stats[2].textContent = `${this.venueData.averageRating}⭐`;
            stats[3].textContent = `€${this.venueData.weeklyRevenue}`;
        }
    }

    async loadEvents() {
        try {
            // Simuliamo il caricamento degli eventi
            this.events = [
                {
                    id: 1,
                    name: '🎵 Saturday Night Fever',
                    date: '2024-01-15',
                    time: '22:00 - 04:00',
                    capacity: 250,
                    artist: 'DJ Marco',
                    reservations: 89,
                    status: 'confirmed'
                },
                {
                    id: 2,
                    name: '🎤 Live Session',
                    date: '2024-01-21',
                    time: '21:00 - 02:00',
                    capacity: 150,
                    artist: 'Band Local',
                    reservations: 45,
                    status: 'pending'
                },
                {
                    id: 3,
                    name: '✨ Exclusive Night',
                    date: '2024-01-28',
                    time: '23:00 - 05:00',
                    capacity: 100,
                    artist: 'Solo invito',
                    reservations: 67,
                    status: 'confirmed'
                }
            ];
            
            this.renderEventTimeline();
        } catch (error) {
            console.error('Errore nel caricamento eventi:', error);
        }
    }

    renderEventTimeline() {
        const container = document.getElementById('eventTimeline');
        if (!container) return;

        const eventsHTML = this.events.map(event => {
            const eventDate = new Date(event.date);
            const day = eventDate.getDate();
            const month = eventDate.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase();
            const statusClass = event.status === 'confirmed' ? 'status-confirmed' : 'status-pending';
            
            return `
                <div class="timeline-item" data-event-id="${event.id}">
                    <div class="timeline-date">
                        <strong>${day}</strong><br>${month}
                    </div>
                    <div class="timeline-content">
                        <h4>${event.name}</h4>
                        <p>${event.time} • ${event.capacity} posti • ${event.artist}</p>
                        <div style="margin-top: 8px;">
                            <span class="status-badge ${statusClass}">${event.reservations} Prenotati</span>
                            <button class="btn-secondary" onclick="managerDashboard.manageEvent(${event.id})">Gestisci</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Mantieni il pulsante originale
        const createButton = container.querySelector('.btn-gradient');
        container.innerHTML = eventsHTML;
    }

    async loadReservations() {
        try {
            // Simuliamo il caricamento delle prenotazioni
            this.reservations = [
                {
                    id: 1,
                    clientName: 'Marco R.',
                    table: 'T1',
                    guests: 4,
                    time: '22:30',
                    status: 'confirmed'
                },
                {
                    id: 2,
                    clientName: 'Sofia M.',
                    table: 'T5',
                    guests: 6,
                    time: '23:00',
                    status: 'pending'
                },
                {
                    id: 3,
                    clientName: 'Andrea L.',
                    table: 'T3',
                    guests: 2,
                    time: '22:00',
                    status: 'cancelled'
                }
            ];
            
            this.renderReservationsTable();
        } catch (error) {
            console.error('Errore nel caricamento prenotazioni:', error);
        }
    }

    renderReservationsTable() {
        const tbody = document.getElementById('reservationsTable');
        if (!tbody) return;

        const reservationsHTML = this.reservations.map(reservation => {
            const statusClass = `status-${reservation.status}`;
            const statusText = {
                'confirmed': 'Confermato',
                'pending': 'In attesa',
                'cancelled': 'No-show'
            }[reservation.status];
            
            const actionButton = reservation.status === 'confirmed' 
                ? `<button class="btn-secondary" onclick="managerDashboard.checkIn(${reservation.id})">Check-in</button>`
                : reservation.status === 'pending'
                ? `<button class="btn-secondary" onclick="managerDashboard.confirmReservation(${reservation.id})">Conferma</button>`
                : `<button class="btn-secondary" onclick="managerDashboard.reportNoShow(${reservation.id})">Segnala</button>`;
            
            return `
                <tr data-reservation-id="${reservation.id}">
                    <td>${reservation.clientName}</td>
                    <td>${reservation.table}</td>
                    <td>${reservation.guests}</td>
                    <td>${reservation.time}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${actionButton}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = reservationsHTML;
    }

    setupEventListeners() {
        // Event listener per il form di creazione eventi
        const createEventForm = document.getElementById('createEventForm');
        if (createEventForm) {
            createEventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateEvent(new FormData(createEventForm));
            });
        }
    }

    startRealtimeUpdates() {
        // Simula aggiornamenti in tempo reale ogni 30 secondi
        setInterval(() => {
            this.updateQuickStats();
            this.checkForNewReservations();
        }, 30000);
    }

    checkForNewReservations() {
        // Simula controllo di nuove prenotazioni
        const randomUpdate = Math.random() > 0.8;
        if (randomUpdate) {
            this.venueData.todayReservations += Math.floor(Math.random() * 3) + 1;
            this.updateQuickStats();
            window.app.showToast('🎉 Nuova prenotazione ricevuta!', 'success');
        }
    }

    // Metodi per la gestione degli eventi
    manageEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            this.showEventManagementModal(event);
        }
    }

    showEventManagementModal(event) {
        const modal = this.createModal('eventManagementModal', 'Gestisci Evento', `
            <div>
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3>${event.name}</h3>
                    <p><strong>📅 ${new Date(event.date).toLocaleDateString('it-IT')}</strong></p>
                    <p><strong>🕒 ${event.time}</strong></p>
                    <p><strong>🎤 ${event.artist}</strong></p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
                    <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                        <h4>${event.capacity}</h4>
                        <p>Capienza</p>
                    </div>
                    <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                        <h4>${event.reservations}</h4>
                        <p>Prenotazioni</p>
                    </div>
                    <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                        <h4>${Math.round((event.reservations / event.capacity) * 100)}%</h4>
                        <p>Occupazione</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 20px;">
                    <button class="btn-gradient" onclick="managerDashboard.editEventDetails(${event.id})">
                        <i class="fas fa-edit"></i> Modifica Dettagli
                    </button>
                    <button class="btn-gradient" onclick="managerDashboard.manageGuestList(${event.id})">
                        <i class="fas fa-users"></i> Lista Ospiti
                    </button>
                    <button class="btn-gradient" onclick="managerDashboard.viewEventStats(${event.id})">
                        <i class="fas fa-chart-bar"></i> Statistiche
                    </button>
                    <button class="btn-gradient" onclick="managerDashboard.shareEvent(${event.id})">
                        <i class="fas fa-share"></i> Condividi
                    </button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
        setTimeout(() => modal.style.display = 'flex', 10);
    }

    async handleCreateEvent(formData) {
        try {
            const eventData = Object.fromEntries(formData.entries());
            
            // Simuliamo la creazione dell'evento
            const newEvent = {
                id: this.events.length + 1,
                name: eventData.eventName,
                date: eventData.eventDate.split('T')[0],
                time: this.formatEventTime(eventData.eventDate),
                capacity: parseInt(eventData.capacity),
                artist: eventData.artist || 'TBD',
                reservations: 0,
                status: 'pending',
                description: eventData.description,
                price: parseFloat(eventData.price) || 0
            };
            
            this.events.push(newEvent);
            this.renderEventTimeline();
            
            closeModal('createEventModal');
            window.app.showToast('Evento creato con successo! 🎉', 'success');
            
        } catch (error) {
            console.error('Errore nella creazione evento:', error);
            window.app.showToast('Errore nella creazione evento', 'error');
        }
    }

    formatEventTime(datetime) {
        const date = new Date(datetime);
        return date.toTimeString().slice(0, 5) + ' - ' + 
               new Date(date.getTime() + 6 * 60 * 60 * 1000).toTimeString().slice(0, 5);
    }

    // Metodi per la gestione delle prenotazioni
    checkIn(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (reservation) {
            reservation.status = 'checked-in';
            this.renderReservationsTable();
            window.app.showToast(`Check-in completato per ${reservation.clientName}! ✅`, 'success');
        }
    }

    confirmReservation(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (reservation) {
            reservation.status = 'confirmed';
            this.renderReservationsTable();
            window.app.showToast(`Prenotazione confermata per ${reservation.clientName}! ✅`, 'success');
        }
    }

    reportNoShow(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (reservation) {
            window.app.showToast(`No-show segnalato per ${reservation.clientName}`, 'warning');
            // Qui si potrebbe implementare un sistema di penalità
        }
    }

    refreshReservations() {
        this.loadReservations();
        window.app.showToast('Prenotazioni aggiornate! 🔄', 'info');
    }

    // Metodi per i modali e funzionalità aggiuntive
    editEventDetails(eventId) {
        window.app.showToast('Modifica dettagli evento disponibile prossimamente', 'info');
        closeModal('eventManagementModal');
    }

    manageGuestList(eventId) {
        window.app.showToast('Gestione lista ospiti disponibile prossimamente', 'info');
        closeModal('eventManagementModal');
    }

    viewEventStats(eventId) {
        window.app.showToast('Statistiche dettagliate disponibili prossimamente', 'info');
        closeModal('eventManagementModal');
    }

    shareEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event && navigator.share) {
            navigator.share({
                title: event.name,
                text: `${event.name} - ${new Date(event.date).toLocaleDateString('it-IT')} presso ${this.venueData.name}`,
                url: window.location.href
            });
        } else {
            const shareText = `${event.name} - ${new Date(event.date).toLocaleDateString('it-IT')} presso ${this.venueData.name}`;
            navigator.clipboard.writeText(shareText);
            window.app.showToast('Link evento copiato negli appunti!', 'success');
        }
        closeModal('eventManagementModal');
    }

    createModal(id, title, content) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>${title}</h3>
                    <button onclick="closeModal('${id}')" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                ${content}
            </div>
        `;
        
        return modal;
    }
}

// Funzioni globali per gli onclick HTML
function createEvent() {
    const modal = document.getElementById('createEventModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function refreshReservations() {
    managerDashboard.refreshReservations();
}

function checkIn(reservationId) {
    managerDashboard.checkIn(reservationId);
}

function confirmReservation(reservationId) {
    managerDashboard.confirmReservation(reservationId);
}

function reportNoShow(reservationId) {
    managerDashboard.reportNoShow(reservationId);
}

function manageEvent(eventId) {
    managerDashboard.manageEvent(eventId);
}

function viewDetailedStats() {
    const modal = managerDashboard.createModal('detailedStatsModal', 'Statistiche Dettagliate', `
        <div style="text-align: center;">
            <h4>📊 Performance Locale - Questa Settimana</h4>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
                <div style="padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <h3>1,247</h3>
                    <p>Visualizzazioni Totali</p>
                    <small style="color: #2ecc71;">+23% vs settimana scorsa</small>
                </div>
                <div style="padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <h3>456</h3>
                    <p>Prenotazioni</p>
                    <small style="color: #2ecc71;">+18% vs settimana scorsa</small>
                </div>
                <div style="padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <h3>89%</h3>
                    <p>Tasso Conversione</p>
                    <small style="color: #f39c12;">-2% vs settimana scorsa</small>
                </div>
                <div style="padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <h3>4.7⭐</h3>
                    <p>Rating Medio</p>
                    <small style="color: #2ecc71;">+0.3 vs settimana scorsa</small>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <h4>🎯 Top Performers</h4>
                <p><strong>Evento più visto:</strong> Saturday Night Fever (234 visualizzazioni)</p>
                <p><strong>Evento più prenotato:</strong> Live Session (89 prenotazioni)</p>
                <p><strong>Miglior rating:</strong> Exclusive Night (4.9⭐)</p>
            </div>
            
            <button class="btn-gradient" onclick="closeModal('detailedStatsModal')">
                <i class="fas fa-check"></i> Chiudi
            </button>
        </div>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.style.display = 'flex', 10);
}

function viewAllReviews() {
    const modal = managerDashboard.createModal('allReviewsModal', 'Tutte le Recensioni', `
        <div style="max-height: 400px; overflow-y: auto;">
            <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong>Marco R.</strong>
                    <div style="color: #feca57;">⭐⭐⭐⭐⭐</div>
                </div>
                <p>"Serata fantastica! Musica top e servizio eccellente. Tornerò sicuramente!"</p>
                <small style="opacity: 0.6;">Saturday Night Fever - 2 giorni fa</small>
            </div>
            
            <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong>Sofia M.</strong>
                    <div style="color: #feca57;">⭐⭐⭐⭐</div>
                </div>
                <p>"Ambiente molto bello, forse un po' troppo affollato il sabato sera."</p>
                <small style="opacity: 0.6;">Saturday Night Fever - 5 giorni fa</small>
            </div>
            
            <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong>Andrea L.</strong>
                    <div style="color: #feca57;">⭐⭐⭐⭐⭐</div>
                </div>
                <p>"DJ fantastico e atmosfera perfetta! Complimenti!"</p>
                <small style="opacity: 0.6;">Live Session - 1 settimana fa</small>
            </div>
            
            <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong>Giulia P.</strong>
                    <div style="color: #feca57;">⭐⭐⭐</div>
                </div>
                <p>"Locale carino ma prezzi un po' alti. Servizio comunque buono."</p>
                <small style="opacity: 0.6;">Exclusive Night - 1 settimana fa</small>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn-gradient" onclick="closeModal('allReviewsModal')">
                <i class="fas fa-check"></i> Chiudi
            </button>
        </div>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.style.display = 'flex', 10);
}

function openFlir2nightPanel() {
    const modal = managerDashboard.createModal('flir2nightPanelModal', 'Flir2night Panel', `
        <div>
            <h4 style="margin-bottom: 20px;">🗨️ Menzioni del tuo locale</h4>
            
            <div style="max-height: 300px; overflow-y: auto;">
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong>@marcoDJ</strong>
                        <small style="opacity: 0.6;">2 ore fa</small>
                    </div>
                    <p>"Saturday Night al Club Elite è stato 🔥🔥🔥 Che serata ragazzi!"</p>
                    <div style="margin-top: 8px;">
                        <small>❤️ 23 · 💬 8 · 🔄 5</small>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong>@sofia_m</strong>
                        <small style="opacity: 0.6;">1 giorno fa</small>
                    </div>
                    <p>"Che location! Club Elite perfetto per una serata con le amiche 💃✨"</p>
                    <div style="margin-top: 8px;">
                        <small>❤️ 15 · 💬 5 · 🔄 3</small>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong>@andrea_music</strong>
                        <small style="opacity: 0.6;">3 giorni fa</small>
                    </div>
                    <p>"Grazie Club Elite per avermi ospitato! Pubblico fantastico 🎵"</p>
                    <div style="margin-top: 8px;">
                        <small>❤️ 31 · 💬 12 · 🔄 8</small>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <p style="margin-bottom: 15px;">📊 <strong>Sentiment Analysis:</strong> 92% Positivo</p>
                <button class="btn-gradient" onclick="closeModal('flir2nightPanelModal')">
                    <i class="fas fa-check"></i> Chiudi
                </button>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.style.display = 'flex', 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // Rimuovi modal creati dinamicamente
        if (!['createEventModal'].includes(modalId)) {
            setTimeout(() => modal.remove(), 300);
        }
    }
}

// Inizializza la dashboard quando la pagina è caricata
let managerDashboard;
document.addEventListener('DOMContentLoaded', () => {
    managerDashboard = new ManagerDashboard();
});