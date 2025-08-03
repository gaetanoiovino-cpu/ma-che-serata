class PRDashboard {
    constructor() {
        this.events = [];
        this.guests = [];
        this.init();
    }

    init() {
        console.log('PR Dashboard inizializzata');
        this.loadUserData();
        this.loadPromotedEvents();
        this.setupEventListeners();
    }

    async loadUserData() {
        try {
            // Simuliamo il caricamento dei dati utente
            const userData = {
                name: 'Marco',
                level: 3,
                points: 2450,
                badge: 'Top Host',
                activeEvents: 3,
                confirmedGuests: 127
            };
            
            document.getElementById('welcomeMessage').textContent = `Ciao ${userData.name}! 🎉`;
            this.updateLevelInfo(userData);
        } catch (error) {
            console.error('Errore nel caricamento dati utente:', error);
        }
    }

    updateLevelInfo(userData) {
        const levelBadge = document.querySelector('.level-badge');
        if (levelBadge) {
            levelBadge.innerHTML = `
                <h3>🎯 StagePass Level ${userData.level}</h3>
                <p>${userData.badge} · ${userData.points} punti</p>
            `;
        }
    }

    async loadPromotedEvents() {
        try {
            // Simuliamo il caricamento degli eventi promossi
            this.events = [
                {
                    id: 1,
                    name: '🎵 Saturday Night Fever',
                    date: 'Sabato 15 Gen',
                    venue: 'Discoteca XYZ',
                    views: 156,
                    clicks: 23,
                    checkins: 12
                },
                {
                    id: 2,
                    name: '🎤 Live Session',
                    date: 'Venerdì 21 Gen',
                    venue: 'Club Elite',
                    views: 89,
                    clicks: 15,
                    checkins: 8
                }
            ];
            
            this.renderPromotedEvents();
        } catch (error) {
            console.error('Errore nel caricamento eventi:', error);
        }
    }

    renderPromotedEvents() {
        const container = document.getElementById('promotedEvents');
        if (!container) return;

        const eventsHTML = this.events.map(event => `
            <div class="event-item" data-event-id="${event.id}">
                <h4>${event.name}</h4>
                <p>${event.date} · ${event.venue}</p>
                <div class="event-stats">
                    <div class="stat-item">
                        <strong>${event.views}</strong>
                        <small>Visualizzazioni</small>
                    </div>
                    <div class="stat-item">
                        <strong>${event.clicks}</strong>
                        <small>Click</small>
                    </div>
                    <div class="stat-item">
                        <strong>${event.checkins}</strong>
                        <small>Check-in</small>
                    </div>
                </div>
                <div style="margin-top: 10px;">
                    <button class="btn-gradient" onclick="prDashboard.editEvent(${event.id})" style="font-size: 12px; padding: 6px 12px;">
                        <i class="fas fa-edit"></i> Modifica
                    </button>
                    <button class="btn-gradient" onclick="prDashboard.viewEventDetails(${event.id})" style="font-size: 12px; padding: 6px 12px; margin-left: 5px;">
                        <i class="fas fa-eye"></i> Dettagli
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = eventsHTML + container.querySelector('button').outerHTML;
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

    // Funzioni per la gestione degli eventi
    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            window.app.showToast(`Modifica evento: ${event.name}`, 'info');
            // Qui implementeremo la logica di modifica
        }
    }

    viewEventDetails(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            this.showEventDetailsModal(event);
        }
    }

    showEventDetailsModal(event) {
        const modal = this.createModal('eventDetailsModal', 'Dettagli Evento', `
            <div style="text-align: center;">
                <h3>${event.name}</h3>
                <p><strong>📅 ${event.date}</strong></p>
                <p><strong>📍 ${event.venue}</strong></p>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
                    <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                        <h4>${event.views}</h4>
                        <p>Visualizzazioni</p>
                    </div>
                    <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                        <h4>${event.clicks}</h4>
                        <p>Click</p>
                    </div>
                    <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                        <h4>${event.checkins}</h4>
                        <p>Check-in</p>
                    </div>
                </div>
                
                <div style="margin: 20px 0;">
                    <h4>📈 Performance</h4>
                    <p>Tasso di conversione: ${((event.clicks / event.views) * 100).toFixed(1)}%</p>
                    <p>Tasso di partecipazione: ${((event.checkins / event.clicks) * 100).toFixed(1)}%</p>
                </div>
                
                <button class="btn-gradient" onclick="prDashboard.shareEvent(${event.id})">
                    <i class="fas fa-share"></i> Condividi Evento
                </button>
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
                name: eventData.eventName || 'Nuovo Evento',
                date: this.formatDate(new Date(eventData.eventDate)),
                venue: eventData.venue || 'Venue TBD',
                views: 0,
                clicks: 0,
                checkins: 0
            };
            
            this.events.push(newEvent);
            this.renderPromotedEvents();
            
            closeModal('createEventModal');
            window.app.showToast('Evento creato con successo! 🎉', 'success');
            
        } catch (error) {
            console.error('Errore nella creazione evento:', error);
            window.app.showToast('Errore nella creazione evento', 'error');
        }
    }

    formatDate(date) {
        const options = { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'short' 
        };
        return date.toLocaleDateString('it-IT', options);
    }

    shareEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event && navigator.share) {
            navigator.share({
                title: event.name,
                text: `${event.name} - ${event.date} presso ${event.venue}`,
                url: window.location.href
            });
        } else {
            // Fallback per browser che non supportano Web Share API
            const shareText = `${event.name} - ${event.date} presso ${event.venue}`;
            navigator.clipboard.writeText(shareText);
            window.app.showToast('Link copiato negli appunti!', 'success');
        }
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
function createNewEvent() {
    const modal = document.getElementById('createEventModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function manageGuestList() {
    const modal = prDashboard.createModal('guestListModal', 'Gestione Lista Invitati', `
        <div style="text-align: center;">
            <div style="margin-bottom: 20px;">
                <input type="email" placeholder="Inserisci email invitato..." style="width: 70%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; margin-right: 10px;">
                <button class="btn-gradient" onclick="prDashboard.addGuest()">
                    <i class="fas fa-plus"></i> Invita
                </button>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin: 15px 0;">
                <h4>📊 Statistiche Inviti</h4>
                <p>👥 127 invitati confermati</p>
                <p>⏳ 23 in attesa di risposta</p>
                <p>❌ 12 rifiutati</p>
                <p>📧 156 inviti inviati totali</p>
            </div>
            
            <button class="btn-gradient" onclick="prDashboard.exportGuestList()">
                <i class="fas fa-download"></i> Esporta Lista
            </button>
        </div>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.style.display = 'flex', 10);
}

function shareReferralCode() {
    const referralCode = 'MCSPR2024';
    const shareText = `Entra in Ma Che Serata con il mio codice: ${referralCode}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Ma Che Serata - Codice Invito',
            text: shareText,
            url: window.location.origin
        });
    } else {
        navigator.clipboard.writeText(shareText);
        window.app.showToast('Codice copiato negli appunti!', 'success');
    }
}

function openInviteGenerator() {
    const modal = prDashboard.createModal('inviteGeneratorModal', 'Smart Invite Generator', `
        <div style="text-align: center;">
            <div style="margin-bottom: 20px;">
                <h4>🎨 Genera Locandina Personalizzata</h4>
                <p>Seleziona un template per il tuo evento</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
                <div style="padding: 20px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 10px; cursor: pointer;" onclick="prDashboard.selectTemplate('party')">
                    <h4>🎉 Party</h4>
                    <p>Template festoso</p>
                </div>
                <div style="padding: 20px; background: linear-gradient(135deg, #ff6b6b, #ee5a24); border-radius: 10px; cursor: pointer;" onclick="prDashboard.selectTemplate('club')">
                    <h4>🎵 Club</h4>
                    <p>Template club</p>
                </div>
                <div style="padding: 20px; background: linear-gradient(135deg, #48dbfb, #0abde3); border-radius: 10px; cursor: pointer;" onclick="prDashboard.selectTemplate('live')">
                    <h4>🎤 Live</h4>
                    <p>Template concerti</p>
                </div>
                <div style="padding: 20px; background: linear-gradient(135deg, #feca57, #ff9ff3); border-radius: 10px; cursor: pointer;" onclick="prDashboard.selectTemplate('exclusive')">
                    <h4>✨ Exclusive</h4>
                    <p>Template esclusivo</p>
                </div>
            </div>
            
            <p style="opacity: 0.8;">Scegli un template per continuare</p>
        </div>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.style.display = 'flex', 10);
}

function openChatManager() {
    const modal = prDashboard.createModal('chatManagerModal', 'Chat con Gestori', `
        <div>
            <div style="height: 300px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                    <strong>Club Elite</strong>
                    <p style="margin: 5px 0; font-size: 14px;">Confermi per venerdì sera? Abbiamo bisogno di sapere quanti invitati porterai.</p>
                    <small style="opacity: 0.6;">2 ore fa</small>
                </div>
                
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(102, 126, 234, 0.2); border-radius: 8px; margin-left: 20px;">
                    <strong>Tu</strong>
                    <p style="margin: 5px 0; font-size: 14px;">Ciao! Sì confermo, dovrei portare circa 15-20 persone.</p>
                    <small style="opacity: 0.6;">1 ora fa</small>
                </div>
                
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                    <strong>Discoteca XYZ</strong>
                    <p style="margin: 5px 0; font-size: 14px;">Perfetto per sabato! Ti aspettiamo per il Saturday Night Fever 🎉</p>
                    <small style="opacity: 0.6;">30 min fa</small>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <input type="text" placeholder="Scrivi un messaggio..." style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;">
                <button class="btn-gradient">
                    <i class="fas fa-paper-plane"></i>
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
let prDashboard;
document.addEventListener('DOMContentLoaded', () => {
    prDashboard = new PRDashboard();
});

// Estendi la classe PRDashboard con metodi aggiuntivi
PRDashboard.prototype.addGuest = function() {
    window.app.showToast('Invito inviato!', 'success');
};

PRDashboard.prototype.exportGuestList = function() {
    window.app.showToast('Lista esportata!', 'success');
};

PRDashboard.prototype.selectTemplate = function(template) {
    window.app.showToast(`Template "${template}" selezionato! 🎨`, 'success');
    closeModal('inviteGeneratorModal');
};