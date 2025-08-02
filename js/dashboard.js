// Dashboard Manager - Ma Che Serata
class DashboardManager {
    constructor() {
        this.userProfile = {};
        this.selectedInterests = [];
        this.maxInterests = 5;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUserProfile();
        this.initCharCounter();
        this.initInterestTags();
    }

    bindEvents() {
        // Profile photo events
        const photoPlaceholder = document.getElementById('photoPlaceholder');
        const profilePhotoInput = document.getElementById('profilePhotoInput');
        
        if (photoPlaceholder) {
            photoPlaceholder.addEventListener('click', () => {
                this.editProfilePhoto();
            });
        }

        if (profilePhotoInput) {
            profilePhotoInput.addEventListener('change', (e) => {
                this.handlePhotoUpload(e);
            });
        }

        // Dashboard card events
        this.bindCardEvents();
    }

    bindCardEvents() {
        // Make all dashboard cards functional
        const eventCards = document.querySelectorAll('.btn-card-action');
        eventCards.forEach((btn, index) => {
            const card = btn.closest('.dashboard-card');
            const title = card.querySelector('.feature-title').textContent;
            
            btn.addEventListener('click', () => {
                this.handleCardAction(title);
            });
        });
    }

    handleCardAction(cardTitle) {
        switch(cardTitle) {
            case 'I Miei Eventi':
                this.showEvents();
                break;
            case 'Eventi Salvati':
                this.showSavedEvents();
                break;
            case 'Prenota Insieme':
                this.showBookTogether();
                break;
            case 'Flir2night':
                window.location.href = 'flir2night.html';
                break;
            case 'I Miei Gruppi':
                this.showGroups();
                break;
            case 'Notifiche':
                this.showNotifications();
                break;
            default:
                console.log('Card action not implemented:', cardTitle);
        }
    }

    // Profile Management
    editProfilePhoto() {
        const profilePhotoInput = document.getElementById('profilePhotoInput');
        if (profilePhotoInput) {
            profilePhotoInput.click();
        }
    }

    async handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showToast('Seleziona un file immagine valido', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            this.showToast('L\'immagine deve essere inferiore a 5MB', 'error');
            return;
        }

        try {
            // Show preview immediately
            this.showPhotoPreview(file);
            
            // Upload to Supabase
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/upload-profile-photo', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.userProfile.profile_photo = data.url;
                    this.showToast('Foto profilo aggiornata!', 'success');
                } else {
                    throw new Error(data.error || 'Upload fallito');
                }
            } else {
                throw new Error('Errore server durante upload');
            }
        } catch (error) {
            console.error('Photo upload error:', error);
            this.showToast('Errore durante l\'upload della foto', 'error');
        }
    }

    showPhotoPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const profilePhoto = document.getElementById('profilePhoto');
            const photoPlaceholder = document.getElementById('photoPlaceholder');
            
            if (profilePhoto && photoPlaceholder) {
                profilePhoto.src = e.target.result;
                profilePhoto.classList.add('loaded');
                photoPlaceholder.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }

    initCharCounter() {
        const textarea = document.getElementById('profileDescription');
        const charCount = document.getElementById('charCount');
        
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                const length = textarea.value.length;
                charCount.textContent = length;
                
                // Update counter color
                charCount.className = '';
                if (length > 100) {
                    charCount.classList.add('warning');
                }
                if (length > 115) {
                    charCount.classList.add('danger');
                }
            });
        }
    }

    initInterestTags() {
        const interestTags = document.querySelectorAll('.interest-tag');
        
        interestTags.forEach(tag => {
            tag.addEventListener('click', () => {
                this.toggleInterest(tag);
            });
        });
    }

    toggleInterest(tag) {
        const interest = tag.dataset.interest;
        const isSelected = tag.classList.contains('selected');
        
        if (isSelected) {
            // Remove interest
            tag.classList.remove('selected');
            this.selectedInterests = this.selectedInterests.filter(i => i !== interest);
        } else {
            // Add interest (check limit)
            if (this.selectedInterests.length >= this.maxInterests) {
                this.showToast(`Puoi selezionare massimo ${this.maxInterests} interessi`, 'warning');
                return;
            }
            
            tag.classList.add('selected');
            this.selectedInterests.push(interest);
        }
    }

    async saveProfile() {
        const description = document.getElementById('profileDescription').value;
        
        if (description.length === 0) {
            this.showToast('Aggiungi una descrizione per completare il profilo', 'warning');
            return;
        }

        if (description.length > 120) {
            this.showToast('La descrizione non può superare 120 caratteri', 'error');
            return;
        }

        try {
            const profileData = {
                description: description,
                interests: this.selectedInterests,
                profile_photo: this.userProfile.profile_photo || null
            };

            const response = await fetch('/api/save-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.showToast('Profilo salvato con successo! 🎉', 'success');
                    this.userProfile = { ...this.userProfile, ...profileData };
                } else {
                    throw new Error(data.error || 'Errore durante il salvataggio');
                }
            } else {
                throw new Error('Errore server');
            }
        } catch (error) {
            console.error('Save profile error:', error);
            this.showToast('Errore durante il salvataggio del profilo', 'error');
        }
    }

    resetProfile() {
        // Reset form
        document.getElementById('profileDescription').value = '';
        document.getElementById('charCount').textContent = '0';
        
        // Reset interests
        document.querySelectorAll('.interest-tag.selected').forEach(tag => {
            tag.classList.remove('selected');
        });
        this.selectedInterests = [];
        
        // Reset photo
        const profilePhoto = document.getElementById('profilePhoto');
        const photoPlaceholder = document.getElementById('photoPlaceholder');
        
        if (profilePhoto && photoPlaceholder) {
            profilePhoto.src = '';
            profilePhoto.classList.remove('loaded');
            photoPlaceholder.style.display = 'flex';
        }
        
        this.showToast('Profilo ripristinato', 'info');
    }

    async loadUserProfile() {
        try {
            const response = await fetch('/api/get-profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.profile) {
                    this.populateProfile(data.profile);
                }
            }
        } catch (error) {
            console.log('Profile not found or error loading:', error);
        }
    }

    populateProfile(profile) {
        // Set description
        if (profile.description) {
            const descTextarea = document.getElementById('profileDescription');
            if (descTextarea) {
                descTextarea.value = profile.description;
                document.getElementById('charCount').textContent = profile.description.length;
            }
        }

        // Set photo
        if (profile.profile_photo) {
            const profilePhoto = document.getElementById('profilePhoto');
            const photoPlaceholder = document.getElementById('photoPlaceholder');
            
            if (profilePhoto && photoPlaceholder) {
                profilePhoto.src = profile.profile_photo;
                profilePhoto.classList.add('loaded');
                photoPlaceholder.style.display = 'none';
            }
        }

        // Set interests
        if (profile.interests && profile.interests.length > 0) {
            this.selectedInterests = profile.interests;
            profile.interests.forEach(interest => {
                const tag = document.querySelector(`[data-interest="${interest}"]`);
                if (tag) {
                    tag.classList.add('selected');
                }
            });
        }

        this.userProfile = profile;
    }

    // Dashboard Features
    showEvents() {
        this.showModal('I Miei Eventi', this.getEventsContent());
    }

    showSavedEvents() {
        this.showModal('Eventi Salvati', this.getSavedEventsContent());
    }

    showBookTogether() {
        this.showModal('Prenota Insieme', this.getBookTogetherContent());
    }

    showGroups() {
        this.showModal('I Miei Gruppi', this.getGroupsContent());
    }

    showNotifications() {
        this.showModal('Notifiche', this.getNotificationsContent());
    }

    // Modal Content Generators
    getEventsContent() {
        return `
            <div class="events-content">
                <div class="events-tabs">
                    <button class="tab-btn active" data-tab="upcoming">Prossimi (3)</button>
                    <button class="tab-btn" data-tab="past">Passati (9)</button>
                    <button class="tab-btn" data-tab="pending">In Attesa (2)</button>
                </div>
                
                <div class="events-list" id="eventsList">
                    <div class="event-item">
                        <div class="event-info">
                            <h4>🎭 Notte Magica al Duomo</h4>
                            <p>📅 Sabato 25 Gen • 🕙 22:00</p>
                            <p>📍 Terrazza Duomo Milano</p>
                        </div>
                        <div class="event-actions">
                            <span class="event-status confirmed">Confermato</span>
                            <button class="btn-small">Dettagli</button>
                        </div>
                    </div>
                    
                    <div class="event-item">
                        <div class="event-info">
                            <h4>🍸 Cocktail & Beats</h4>
                            <p>📅 Domenica 26 Gen • 🕘 19:00</p>
                            <p>📍 Navigli Social Club</p>
                        </div>
                        <div class="event-actions">
                            <span class="event-status confirmed">Confermato</span>
                            <button class="btn-small">Dettagli</button>
                        </div>
                    </div>
                    
                    <div class="event-item">
                        <div class="event-info">
                            <h4>🎵 Electronic Vibes</h4>
                            <p>📅 Venerdì 31 Gen • 🕙 23:00</p>
                            <p>📍 Dude Club</p>
                        </div>
                        <div class="event-actions">
                            <span class="event-status confirmed">Confermato</span>
                            <button class="btn-small">Dettagli</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getBookTogetherContent() {
        return `
            <div class="book-together-content">
                <div class="section-header">
                    <h3>👥 Prenota Insieme</h3>
                    <button class="btn-primary" onclick="dashboard.createBookTogether()">+ Crea Nuovo Gruppo</button>
                </div>
                
                <div class="groups-list">
                    <div class="group-item active">
                        <div class="group-info">
                            <h4>🎭 Gruppo Duomo Night</h4>
                            <p>👤 Creato da te • 👥 3/6 persone</p>
                            <p>🎯 Evento: Notte Magica al Duomo</p>
                        </div>
                        <div class="group-members">
                            <div class="member-avatar">👤</div>
                            <div class="member-avatar">👩</div>
                            <div class="member-avatar">👨</div>
                            <div class="member-slot empty">+</div>
                        </div>
                        <div class="group-actions">
                            <button class="btn-small">Gestisci</button>
                            <button class="btn-small btn-success">Invita Amici</button>
                        </div>
                    </div>
                    
                    <div class="group-item">
                        <div class="group-info">
                            <h4>🍸 Aperitivo Squad</h4>
                            <p>👤 Creato da MilanNightQueen • 👥 2/4 persone</p>
                            <p>🎯 Evento: Cocktail & Beats</p>
                        </div>
                        <div class="group-members">
                            <div class="member-avatar">👩</div>
                            <div class="member-avatar">👤</div>
                            <div class="member-slot empty">+</div>
                            <div class="member-slot empty">+</div>
                        </div>
                        <div class="group-actions">
                            <span class="join-status pending">Richiesta Inviata</span>
                            <button class="btn-small btn-secondary">Annulla</button>
                        </div>
                    </div>
                </div>
                
                <div class="requests-section">
                    <h4>📨 Richieste Ricevute (1)</h4>
                    <div class="request-item">
                        <div class="request-info">
                            <strong>PRMilano_Official</strong> ti ha invitato nel gruppo <strong>"VIP Night Out"</strong>
                            <p>🎭 Electronic Vibes • Venerdì 31 Gen</p>
                        </div>
                        <div class="request-actions">
                            <button class="btn-small btn-success">Accetta</button>
                            <button class="btn-small btn-secondary">Rifiuta</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSavedEventsContent() {
        return `
            <div class="saved-events-content">
                <p>🔖 I tuoi eventi salvati per dopo</p>
                <div class="saved-events-list">
                    <div class="saved-event-item">
                        <div class="event-thumb">🎵</div>
                        <div class="event-details">
                            <h4>Techno Underground</h4>
                            <p>📅 5 Feb • 📍 Factory Club</p>
                            <span class="event-tag hot">🔥 Trending</span>
                        </div>
                        <div class="event-actions">
                            <button class="btn-small">Prenota</button>
                            <button class="btn-small btn-secondary">Rimuovi</button>
                        </div>
                    </div>
                    
                    <div class="saved-event-item">
                        <div class="event-thumb">🍸</div>
                        <div class="event-details">
                            <h4>Rooftop Sunset</h4>
                            <p>📅 8 Feb • 📍 Sky Lounge</p>
                            <span class="event-tag">Aperitivo</span>
                        </div>
                        <div class="event-actions">
                            <button class="btn-small">Prenota</button>
                            <button class="btn-small btn-secondary">Rimuovi</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getGroupsContent() {
        return `
            <div class="groups-content">
                <p>👥 Gestisci i tuoi gruppi e connessioni</p>
                <div class="group-stats">
                    <div class="stat">👥 2 Gruppi Attivi</div>
                    <div class="stat">📨 1 Richiesta Pendente</div>
                    <div class="stat">⭐ 4.8 Rating Medio</div>
                </div>
            </div>
        `;
    }

    getNotificationsContent() {
        return `
            <div class="notifications-content">
                <div class="notification-item unread">
                    <div class="notif-icon">🎉</div>
                    <div class="notif-content">
                        <h4>Prenotazione Confermata!</h4>
                        <p>La tua prenotazione per "Notte Magica al Duomo" è stata confermata</p>
                        <span class="notif-time">2 minuti fa</span>
                    </div>
                </div>
                
                <div class="notification-item">
                    <div class="notif-icon">👥</div>
                    <div class="notif-content">
                        <h4>Nuova Richiesta Gruppo</h4>
                        <p>PRMilano_Official ti ha invitato nel gruppo "VIP Night Out"</p>
                        <span class="notif-time">1 ora fa</span>
                    </div>
                </div>
                
                <div class="notification-item">
                    <div class="notif-icon">❤️</div>
                    <div class="notif-content">
                        <h4>Evento Salvato</h4>
                        <p>Hai salvato "Techno Underground" nei tuoi preferiti</p>
                        <span class="notif-time">3 ore fa</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Modal System
    showModal(title, content) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('dashboardModal');
        if (!modal) {
            modal = this.createModal();
        }

        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');

        modalTitle.textContent = title;
        modalBody.innerHTML = content;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Bind tab events if present
        this.bindTabEvents(modal);
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'dashboardModal';
        modal.className = 'modal dashboard-modal';
        modal.innerHTML = `
            <div class="modal-content dashboard-modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                    <button class="close-btn" onclick="dashboard.closeModal()">&times;</button>
                </div>
                <div class="modal-body"></div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        return modal;
    }

    closeModal() {
        const modal = document.getElementById('dashboardModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    bindTabEvents(modal) {
        const tabBtns = modal.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all tabs
                tabBtns.forEach(tab => tab.classList.remove('active'));
                
                // Add active class to clicked tab
                btn.classList.add('active');
                
                // Handle tab content switching
                const tabType = btn.dataset.tab;
                this.handleTabSwitch(tabType);
            });
        });
    }

    handleTabSwitch(tabType) {
        console.log('Switching to tab:', tabType);
        // Implement tab content switching logic here
    }

    // Utility Methods
    showToast(message, type = 'info') {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        } else {
            console.log(`Toast [${type}]:`, message);
        }
    }

    createBookTogether() {
        // Redirect to book together creation
        window.location.href = '#book-together-create';
        this.closeModal();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardManager;
}