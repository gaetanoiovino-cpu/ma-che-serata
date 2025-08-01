class ArtistDashboard {
    constructor() {
        this.events = [];
        this.playlists = [];
        this.collaborations = [];
        this.feedback = [];
        this.artistData = {};
        this.init();
    }

    init() {
        console.log('Artist Dashboard inizializzata');
        this.loadArtistData();
        this.loadUpcomingEvents();
        this.loadPlaylists();
        this.loadCollaborations();
        this.loadFanFeedback();
        this.setupEventListeners();
    }

    async loadArtistData() {
        try {
            // Simuliamo il caricamento dei dati artista
            this.artistData = {
                name: 'DJ Marco',
                genres: ['House', 'Techno', 'Progressive', 'Deep House'],
                location: 'Milano',
                experience: '5 anni',
                popularityLevel: 8.4,
                popularityGrowth: 0.7,
                ranking: 'Top 15%',
                averageRating: 4.8,
                totalReviews: 47
            };
            
            this.updateArtistProfile();
        } catch (error) {
            console.error('Errore nel caricamento dati artista:', error);
        }
    }

    updateArtistProfile() {
        const artistName = document.getElementById('artistName');
        if (artistName) {
            artistName.textContent = this.artistData.name;
        }
    }

    async loadUpcomingEvents() {
        try {
            // Simuliamo il caricamento degli eventi
            this.events = [
                {
                    id: 1,
                    name: '🎵 Saturday Night Fever',
                    date: '2024-01-15',
                    venue: 'Club Elite',
                    time: '22:00 - 04:00',
                    fee: 800,
                    capacity: 250,
                    bookings: 89,
                    status: 'confirmed'
                },
                {
                    id: 2,
                    name: '🎤 Live Session',
                    date: '2024-01-21',
                    venue: 'The Underground',
                    time: '21:00 - 02:00',
                    fee: 600,
                    capacity: 150,
                    bookings: 45,
                    status: 'confirmed'
                },
                {
                    id: 3,
                    name: '✨ Exclusive Night',
                    date: '2024-01-28',
                    venue: 'Rooftop Milano',
                    time: '23:00 - 05:00',
                    fee: 1200,
                    capacity: 100,
                    bookings: 'Solo invito',
                    status: 'exclusive'
                }
            ];
            
            this.renderUpcomingEvents();
        } catch (error) {
            console.error('Errore nel caricamento eventi:', error);
        }
    }

    renderUpcomingEvents() {
        const container = document.getElementById('upcomingEvents');
        if (!container) return;

        const eventsHTML = this.events.map(event => {
            const eventDate = new Date(event.date);
            const dayName = eventDate.toLocaleDateString('it-IT', { weekday: 'short' }).toUpperCase();
            const day = eventDate.getDate();
            const month = eventDate.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase();
            
            return `
                <div class="event-card" data-event-id="${event.id}">
                    <div class="event-date">${dayName} ${day} ${month}</div>
                    <h4>${event.name}</h4>
                    <p><strong>📍 ${event.venue}</strong> • ${event.time}</p>
                    <p>💰 €${event.fee} • 👥 ${event.capacity} posti • 🎯 ${event.bookings} prenotati</p>
                    <div style="margin-top: 10px;">
                        <button class="btn-secondary" onclick="artistDashboard.manageEvent(${event.id})">Gestisci</button>
                        <button class="btn-secondary" onclick="artistDashboard.uploadPlaylist(${event.id})">Upload Playlist</button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = eventsHTML;
    }

    async loadPlaylists() {
        try {
            // Simuliamo il caricamento delle playlist
            this.playlists = [
                {
                    id: 1,
                    name: 'Saturday Night Fever Set',
                    genre: 'House/Techno',
                    tracks: 24,
                    duration: '2h 30min',
                    lastModified: '2 ore fa',
                    icon: 'play'
                },
                {
                    id: 2,
                    name: 'Underground Vibes',
                    genre: 'Deep House',
                    tracks: 18,
                    duration: '1h 45min',
                    lastModified: '1 giorno fa',
                    icon: 'headphones'
                },
                {
                    id: 3,
                    name: 'Exclusive Collection',
                    genre: 'Progressive',
                    tracks: 15,
                    duration: '1h 30min',
                    lastModified: '3 giorni fa',
                    icon: 'star'
                }
            ];
            
            this.renderPlaylists();
        } catch (error) {
            console.error('Errore nel caricamento playlist:', error);
        }
    }

    renderPlaylists() {
        const container = document.getElementById('eventPlaylists');
        if (!container) return;

        const playlistsHTML = this.playlists.map(playlist => `
            <div class="playlist-item" data-playlist-id="${playlist.id}">
                <div class="playlist-cover">
                    <i class="fas fa-${playlist.icon}"></i>
                </div>
                <div style="flex: 1;">
                    <h4>${playlist.name}</h4>
                    <p>${playlist.genre} • ${playlist.tracks} tracce • ${playlist.duration}</p>
                    <small style="opacity: 0.7;">Ultima modifica: ${playlist.lastModified}</small>
                </div>
                <button class="btn-secondary" onclick="editPlaylist(${playlist.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = playlistsHTML;
    }

    async loadCollaborations() {
        try {
            // Simuliamo il caricamento delle collaborazioni
            this.collaborations = [
                {
                    id: 1,
                    type: 'venue',
                    name: 'Club Elite',
                    title: 'Resident DJ Position',
                    description: 'Ogni sabato sera • €800/serata',
                    received: '2 giorni fa',
                    status: 'pending'
                },
                {
                    id: 2,
                    type: 'pr',
                    name: 'PR Sofia',
                    title: 'Festival Summer 2024',
                    description: '3 serate • €1,500 totale',
                    received: '5 giorni fa',
                    status: 'pending'
                }
            ];
            
            this.renderCollaborations();
        } catch (error) {
            console.error('Errore nel caricamento collaborazioni:', error);
        }
    }

    renderCollaborations() {
        const container = document.getElementById('collaborationRequests');
        if (!container) return;

        const collabsHTML = this.collaborations.map(collab => {
            const icon = collab.type === 'venue' ? '🏢' : '📢';
            
            return `
                <div class="collaboration-card" data-collab-id="${collab.id}">
                    <h4>${icon} ${collab.name}</h4>
                    <p><strong>${collab.title}</strong></p>
                    <p>${collab.description}</p>
                    <small style="opacity: 0.6;">Richiesta ricevuta ${collab.received}</small>
                    <div class="collab-actions">
                        <button class="btn-secondary btn-accept" onclick="acceptCollaboration(${collab.id})">
                            <i class="fas fa-check"></i> Accetta
                        </button>
                        <button class="btn-secondary btn-decline" onclick="declineCollaboration(${collab.id})">
                            <i class="fas fa-times"></i> Rifiuta
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = collabsHTML;
    }

    async loadFanFeedback() {
        try {
            // Simuliamo il caricamento del feedback
            this.feedback = [
                {
                    id: 1,
                    user: 'Marco R.',
                    rating: 5,
                    comment: 'Set fantastico! DJ Marco ha fatto ballare tutto il club 🔥',
                    event: 'Saturday Night Fever',
                    date: '2 giorni fa'
                },
                {
                    id: 2,
                    user: 'Sofia M.',
                    rating: 5,
                    comment: 'Selezione musicale perfetta! Che energia!',
                    event: 'Underground Session',
                    date: '5 giorni fa'
                },
                {
                    id: 3,
                    user: 'Andrea L.',
                    rating: 4,
                    comment: 'Grande atmosfera, forse un po\' troppo forte il volume.',
                    event: 'Club Night',
                    date: '1 settimana fa'
                }
            ];
            
            this.renderFanFeedback();
        } catch (error) {
            console.error('Errore nel caricamento feedback:', error);
        }
    }

    renderFanFeedback() {
        const container = document.getElementById('fanFeedback');
        if (!container) return;

        const feedbackHTML = this.feedback.map(feedback => {
            const stars = '⭐'.repeat(feedback.rating);
            
            return `
                <div class="feedback-item" data-feedback-id="${feedback.id}">
                    <div class="feedback-header">
                        <strong>${feedback.user}</strong>
                        <div class="rating-stars">${stars}</div>
                    </div>
                    <p>"${feedback.comment}"</p>
                    <small style="opacity: 0.6;">${feedback.event} - ${feedback.date}</small>
                </div>
            `;
        }).join('');

        container.innerHTML = feedbackHTML;
    }

    setupEventListeners() {
        // Event listener per il form di proposta eventi
        const proposeEventForm = document.getElementById('proposeEventForm');
        if (proposeEventForm) {
            proposeEventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProposeEvent(new FormData(proposeEventForm));
            });
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
                    <p><strong>📍 ${event.venue}</strong></p>
                    <p><strong>🕒 ${event.time}</strong></p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
                    <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                        <h4>€${event.fee}</h4>
                        <p>Cachet</p>
                    </div>
                    <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                        <h4>${event.capacity}</h4>
                        <p>Capienza</p>
                    </div>
                    <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                        <h4>${event.bookings}</h4>
                        <p>Prenotazioni</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 20px;">
                    <button class="btn-gradient" onclick="artistDashboard.viewEventDetails(${event.id})">
                        <i class="fas fa-eye"></i> Dettagli Completi
                    </button>
                    <button class="btn-gradient" onclick="artistDashboard.updateSetlist(${event.id})">
                        <i class="fas fa-music"></i> Aggiorna Setlist
                    </button>
                    <button class="btn-gradient" onclick="artistDashboard.contactVenue(${event.id})">
                        <i class="fas fa-phone"></i> Contatta Venue
                    </button>
                    <button class="btn-gradient" onclick="artistDashboard.shareEvent(${event.id})">
                        <i class="fas fa-share"></i> Condividi
                    </button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
        setTimeout(() => modal.style.display = 'flex', 10);
    }

    uploadPlaylist(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            const modal = this.createModal('uploadPlaylistModal', 'Upload Playlist', `
                <div>
                    <h4>📀 Upload Playlist per ${event.name}</h4>
                    <p style="margin-bottom: 20px; opacity: 0.8;">Carica la tua playlist per l'evento del ${new Date(event.date).toLocaleDateString('it-IT')}</p>
                    
                    <div style="margin-bottom: 20px;">
                        <label>Nome Playlist</label>
                        <input type="text" id="playlistName" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; margin-top: 5px;" value="${event.name} Set">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label>Servizio Streaming</label>
                        <select id="streamingService" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; margin-top: 5px;">
                            <option>Spotify</option>
                            <option>Apple Music</option>
                            <option>SoundCloud</option>
                            <option>Mixcloud</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label>Link Playlist</label>
                        <input type="url" id="playlistUrl" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; margin-top: 5px;" placeholder="https://...">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label>Note per il Venue</label>
                        <textarea id="playlistNotes" rows="3" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; margin-top: 5px; resize: vertical;" placeholder="Aggiungi note sul mood, timing specifico, richieste tecniche..."></textarea>
                    </div>
                    
                    <button class="btn-gradient" onclick="artistDashboard.savePlaylist(${eventId})" style="width: 100%;">
                        <i class="fas fa-upload"></i> Carica Playlist
                    </button>
                </div>
            `);
            
            document.body.appendChild(modal);
            setTimeout(() => modal.style.display = 'flex', 10);
        }
    }

    savePlaylist(eventId) {
        const playlistName = document.getElementById('playlistName').value;
        const streamingService = document.getElementById('streamingService').value;
        const playlistUrl = document.getElementById('playlistUrl').value;
        const notes = document.getElementById('playlistNotes').value;
        
        if (!playlistUrl) {
            window.app.showToast('Inserisci il link della playlist', 'warning');
            return;
        }
        
        // Simuliamo il salvataggio della playlist
        const newPlaylist = {
            id: this.playlists.length + 1,
            name: playlistName,
            genre: 'Mixed',
            tracks: Math.floor(Math.random() * 20) + 10,
            duration: '2h 15min',
            lastModified: 'Ora',
            icon: 'music',
            eventId: eventId,
            service: streamingService,
            url: playlistUrl,
            notes: notes
        };
        
        this.playlists.push(newPlaylist);
        this.renderPlaylists();
        
        closeModal('uploadPlaylistModal');
        window.app.showToast('Playlist caricata con successo! 🎵', 'success');
    }

    async handleProposeEvent(formData) {
        try {
            const eventData = Object.fromEntries(formData.entries());
            
            // Simuliamo l'invio della proposta
            const newProposal = {
                id: Date.now(),
                name: eventData.showName,
                date: eventData.preferredDate,
                venue: eventData.venueTarget,
                genre: eventData.musicGenre,
                description: eventData.showDescription,
                fee: eventData.requestedFee,
                duration: eventData.setDuration,
                status: 'proposed'
            };
            
            closeModal('proposeEventModal');
            window.app.showToast('Proposta inviata con successo! 📧', 'success');
            
        } catch (error) {
            console.error('Errore nell\'invio proposta:', error);
            window.app.showToast('Errore nell\'invio proposta', 'error');
        }
    }

    // Metodi per le altre funzionalità
    viewEventDetails(eventId) {
        window.app.showToast('Dettagli evento disponibili prossimamente', 'info');
        closeModal('eventManagementModal');
    }

    updateSetlist(eventId) {
        window.app.showToast('Editor setlist disponibile prossimamente', 'info');
        closeModal('eventManagementModal');
    }

    contactVenue(eventId) {
        window.app.showToast('Sistema messaggistica venue disponibile prossimamente', 'info');
        closeModal('eventManagementModal');
    }

    shareEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event && navigator.share) {
            navigator.share({
                title: event.name,
                text: `${event.name} - ${new Date(event.date).toLocaleDateString('it-IT')} presso ${event.venue}`,
                url: window.location.href
            });
        } else {
            const shareText = `${event.name} - ${new Date(event.date).toLocaleDateString('it-IT')} presso ${event.venue}`;
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
function proposeEvent() {
    const modal = document.getElementById('proposeEventModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function createPlaylist() {
    const modal = artistDashboard.createModal('createPlaylistModal', 'Crea Nuova Playlist', `
        <div>
            <div style="margin-bottom: 20px;">
                <label>Nome Playlist</label>
                <input type="text" id="newPlaylistName" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; margin-top: 5px;" placeholder="Es: Progressive Night Set">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label>Genere Principale</label>
                <select id="newPlaylistGenre" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; margin-top: 5px;">
                    <option>House</option>
                    <option>Techno</option>
                    <option>Progressive</option>
                    <option>Deep House</option>
                    <option>Tech House</option>
                    <option>Minimal</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label>Mood/Momento</label>
                <select id="playlistMood" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; margin-top: 5px;">
                    <option>Warm Up (22:00-23:00)</option>
                    <option>Prime Time (23:00-01:00)</option>
                    <option>Peak Time (01:00-03:00)</option>
                    <option>After Hours (03:00-05:00)</option>
                    <option>Closing (05:00-06:00)</option>
                </select>
            </div>
            
            <button class="btn-gradient" onclick="artistDashboard.createNewPlaylist()" style="width: 100%;">
                <i class="fas fa-plus"></i> Crea Playlist
            </button>
        </div>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.style.display = 'flex', 10);
}

function editPlaylist(playlistId) {
    const playlist = artistDashboard.playlists.find(p => p.id === playlistId);
    if (playlist) {
        window.app.showToast(`Editing ${playlist.name} - Editor disponibile prossimamente`, 'info');
    }
}

function acceptCollaboration(collabId) {
    const collab = artistDashboard.collaborations.find(c => c.id === collabId);
    if (collab) {
        collab.status = 'accepted';
        artistDashboard.renderCollaborations();
        window.app.showToast(`Collaborazione con ${collab.name} accettata! ✅`, 'success');
    }
}

function declineCollaboration(collabId) {
    const collab = artistDashboard.collaborations.find(c => c.id === collabId);
    if (collab) {
        collab.status = 'declined';
        artistDashboard.renderCollaborations();
        window.app.showToast(`Collaborazione con ${collab.name} rifiutata`, 'warning');
    }
}

function generateAIPlaylist() {
    const modal = artistDashboard.createModal('aiPlaylistModal', 'Genera Playlist AI', `
        <div style="text-align: center;">
            <div style="margin-bottom: 20px;">
                <h4>🤖 Playlist AI Generator</h4>
                <p>L'AI analizzerà il tuo evento e creerà una playlist personalizzata</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin: 20px 0;">
                <div style="margin-bottom: 15px;">
                    <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                        <div style="width: 0%; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 2px; animation: progressBar 3s ease-in-out;" id="aiProgress"></div>
                    </div>
                </div>
                <p id="aiStatus">Analizzando evento...</p>
            </div>
            
            <div id="aiResults" style="display: none;">
                <h4>🎵 Playlist Generata</h4>
                <div style="text-align: left; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin: 15px 0;">
                    <p><strong>Saturday Night Fever - AI Set</strong></p>
                    <p>🎶 22 tracce • 2h 28min</p>
                    <p>📊 Match perfetto per il tuo stile</p>
                    <p>🎯 Ottimizzata per target 25-35 anni</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
                    <button class="btn-gradient" onclick="artistDashboard.saveAIPlaylist()">
                        <i class="fas fa-save"></i> Salva Playlist
                    </button>
                    <button class="btn-secondary" onclick="artistDashboard.regenerateAI()">
                        <i class="fas fa-redo"></i> Rigenera
                    </button>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes progressBar {
                from { width: 0%; }
                to { width: 100%; }
            }
        </style>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.style.display = 'flex', 10);
    
    // Simula il processo AI
    setTimeout(() => {
        document.getElementById('aiStatus').textContent = 'Analizzando target audience...';
    }, 1000);
    
    setTimeout(() => {
        document.getElementById('aiStatus').textContent = 'Selezionando tracce...';
    }, 2000);
    
    setTimeout(() => {
        document.getElementById('aiStatus').textContent = 'Ottimizzando sequenza...';
    }, 2500);
    
    setTimeout(() => {
        document.getElementById('aiResults').style.display = 'block';
        document.getElementById('aiStatus').textContent = 'Playlist generata con successo!';
    }, 3000);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // Rimuovi modal creati dinamicamente
        if (!['proposeEventModal'].includes(modalId)) {
            setTimeout(() => modal.remove(), 300);
        }
    }
}

// Inizializza la dashboard quando la pagina è caricata
let artistDashboard;
document.addEventListener('DOMContentLoaded', () => {
    artistDashboard = new ArtistDashboard();
});

// Estendi la classe ArtistDashboard con metodi aggiuntivi
ArtistDashboard.prototype.createNewPlaylist = function() {
    const name = document.getElementById('newPlaylistName').value;
    const genre = document.getElementById('newPlaylistGenre').value;
    const mood = document.getElementById('playlistMood').value;
    
    if (!name) {
        window.app.showToast('Inserisci un nome per la playlist', 'warning');
        return;
    }
    
    const newPlaylist = {
        id: this.playlists.length + 1,
        name: name,
        genre: genre,
        tracks: 0,
        duration: '0h 0min',
        lastModified: 'Ora',
        icon: 'music',
        mood: mood
    };
    
    this.playlists.push(newPlaylist);
    this.renderPlaylists();
    
    closeModal('createPlaylistModal');
    window.app.showToast('Playlist creata! Ora puoi aggiungere le tracce 🎵', 'success');
};

ArtistDashboard.prototype.saveAIPlaylist = function() {
    const aiPlaylist = {
        id: this.playlists.length + 1,
        name: 'Saturday Night Fever - AI Set',
        genre: 'AI Generated',
        tracks: 22,
        duration: '2h 28min',
        lastModified: 'Ora',
        icon: 'robot'
    };
    
    this.playlists.push(aiPlaylist);
    this.renderPlaylists();
    
    closeModal('aiPlaylistModal');
    window.app.showToast('Playlist AI salvata con successo! 🤖🎵', 'success');
};

ArtistDashboard.prototype.regenerateAI = function() {
    document.getElementById('aiResults').style.display = 'none';
    document.getElementById('aiStatus').textContent = 'Rigenerando playlist...';
    document.getElementById('aiProgress').style.animation = 'none';
    
    setTimeout(() => {
        document.getElementById('aiProgress').style.animation = 'progressBar 2s ease-in-out';
    }, 100);
    
    setTimeout(() => {
        document.getElementById('aiResults').style.display = 'block';
        document.getElementById('aiStatus').textContent = 'Nuova playlist generata!';
    }, 2000);
};