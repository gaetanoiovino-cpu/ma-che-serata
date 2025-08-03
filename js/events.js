// Events Management - Ma Che Serata
class EventsManager {
    constructor() {
        this.events = [];
        this.bookingRequests = [];
        this.init();
    }

    init() {
        this.loadEvents();
        this.bindEvents();
    }

    bindEvents() {
        // Scroll to events section
        const eventsLinks = document.querySelectorAll('[href="#eventi"]');
        eventsLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToEvents();
            });
        });
    }

    scrollToEvents() {
        const eventsSection = document.getElementById('eventi');
        if (eventsSection) {
            eventsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    loadEvents() {
        // Mock events data - in produzione verranno caricate dal database
        this.events = [
            {
                id: 'duomo-night',
                title: 'Notte Magica al Duomo',
                location: 'Terrazza Duomo Milano',
                date: '2024-01-25',
                time: '22:00',
                price: 25,
                category: 'Electronic',
                description: 'Una serata indimenticabile nel cuore di Milano con vista mozzafiato sulla città',
                tags: ['Techno', 'Rooftop', 'Premium'],
                interestedUsers: 5,
                maxCapacity: 100,
                availableSpots: 45
            },
            {
                id: 'cocktail-beats',
                title: 'Cocktail & Beats',
                location: 'Navigli Social Club',
                date: '2024-01-26',
                time: '19:00',
                price: 15,
                category: 'Aperitivo',
                description: 'Aperitivo esclusivo ai Navigli con cocktail artigianali e musica lounge',
                tags: ['Cocktail', 'Lounge', 'Sunset'],
                interestedUsers: 9,
                maxCapacity: 50,
                availableSpots: 25
            },
            {
                id: 'electronic-vibes',
                title: 'Electronic Vibes',
                location: 'Dude Club',
                date: '2024-01-31',
                time: '23:00',
                price: 35,
                category: 'VIP',
                description: 'La notte più elettrizzante del mese con i migliori DJ internazionali',
                tags: ['Techno', 'VIP', 'All Night'],
                interestedUsers: 15,
                maxCapacity: 200,
                availableSpots: 120
            }
        ];
    }

    // Single booking
    bookEvent(eventId) {
        if (!this.isUserLoggedIn()) {
            this.showLoginRequired('prenotare questo evento');
            return;
        }

        const event = this.events.find(e => e.id === eventId);
        if (!event) {
            this.showToast('Evento non trovato', 'error');
            return;
        }

        if (event.availableSpots <= 0) {
            this.showToast('Evento sold out! 😭', 'error');
            return;
        }

        this.showBookingModal(event, 'single');
    }

    // Group booking
    bookTogether(eventId) {
        if (!this.isUserLoggedIn()) {
            this.showLoginRequired('creare un gruppo');
            return;
        }

        const event = this.events.find(e => e.id === eventId);
        if (!event) {
            this.showToast('Evento non trovato', 'error');
            return;
        }

        this.showBookTogetherModal(event);
    }

    showBookingModal(event, type) {
        const modalContent = `
            <div class="booking-modal-content">
                <div class="booking-header">
                    <h3>🎫 ${type === 'single' ? 'Prenota Evento' : 'Prenota Insieme'}</h3>
                    <div class="event-summary">
                        <h4>${event.title}</h4>
                        <p>📍 ${event.location}</p>
                        <p>📅 ${this.formatDate(event.date)} • 🕒 ${event.time}</p>
                        <p>💶 ${event.price}€ a persona</p>
                    </div>
                </div>

                <div class="booking-form">
                    <div class="form-section">
                        <label>Numero di persone</label>
                        <div class="quantity-selector">
                            <button type="button" onclick="this.previousElementSibling.stepDown()" class="qty-btn">-</button>
                            <input type="number" id="guestCount" min="1" max="10" value="1" class="qty-input">
                            <button type="button" onclick="this.previousElementSibling.stepUp()" class="qty-btn">+</button>
                        </div>
                        <small>Prezzo totale: <span id="totalPrice">${event.price}€</span></small>
                    </div>

                    <div class="form-section">
                        <label for="specialRequests">Richieste speciali (opzionale)</label>
                        <textarea id="specialRequests" rows="3" placeholder="Es: tavolo vista, dietary requirements, etc..."></textarea>
                    </div>

                    <div class="booking-summary">
                        <div class="summary-row">
                            <span>Evento:</span>
                            <span>${event.title}</span>
                        </div>
                        <div class="summary-row">
                            <span>Data:</span>
                            <span>${this.formatDate(event.date)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Persone:</span>
                            <span id="summaryGuests">1</span>
                        </div>
                        <div class="summary-row total">
                            <span>Totale:</span>
                            <span id="summaryTotal">${event.price}€</span>
                        </div>
                    </div>

                    <div class="booking-actions">
                        <button class="btn-secondary" onclick="events.closeBookingModal()">
                            Annulla
                        </button>
                        <button class="btn-primary" onclick="events.confirmBooking('${event.id}', 'single')">
                            💳 Conferma Prenotazione
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.showModal('Prenotazione Evento', modalContent);
        this.bindBookingEvents(event);
    }

    showBookTogetherModal(event) {
        const modalContent = `
            <div class="book-together-modal-content">
                <div class="book-together-header">
                    <h3>👥 Crea Gruppo per l'Evento</h3>
                    <div class="event-summary">
                        <h4>${event.title}</h4>
                        <p>📍 ${event.location}</p>
                        <p>📅 ${this.formatDate(event.date)} • 🕒 ${event.time}</p>
                        <p>💶 ${event.price}€ a persona</p>
                    </div>
                </div>

                <div class="group-form">
                    <div class="form-section">
                        <label for="groupName">Nome del gruppo</label>
                        <input type="text" id="groupName" placeholder="Es: Squad Duomo Night, Aperitivo Gang..." maxlength="50">
                        <small>Scegli un nome accattivante per il tuo gruppo!</small>
                    </div>

                    <div class="form-section">
                        <label for="groupSize">Quante persone cerchi?</label>
                        <div class="group-size-selector">
                            <div class="size-options">
                                <label class="size-option">
                                    <input type="radio" name="groupSize" value="2">
                                    <span>2 persone</span>
                                </label>
                                <label class="size-option">
                                    <input type="radio" name="groupSize" value="4" checked>
                                    <span>4 persone</span>
                                </label>
                                <label class="size-option">
                                    <input type="radio" name="groupSize" value="6">
                                    <span>6 persone</span>
                                </label>
                                <label class="size-option">
                                    <input type="radio" name="groupSize" value="custom">
                                    <span>Altro</span>
                                </label>
                            </div>
                            <input type="number" id="customGroupSize" min="2" max="20" value="4" style="display: none;" class="custom-size-input">
                        </div>
                    </div>

                    <div class="form-section">
                        <label for="groupDescription">Descrizione del gruppo</label>
                        <textarea id="groupDescription" rows="3" maxlength="200" placeholder="Descrivi che tipo di persone stai cercando..."></textarea>
                        <small><span id="descCharCount">0</span>/200 caratteri</small>
                    </div>

                    <div class="form-section">
                        <label>Preferenze gruppo</label>
                        <div class="preferences-grid">
                            <label class="preference-option">
                                <input type="checkbox" name="preferences" value="same-age">
                                <span>👥 Stessa fascia d'età</span>
                            </label>
                            <label class="preference-option">
                                <input type="checkbox" name="preferences" value="verified">
                                <span>✅ Solo profili verificati</span>
                            </label>
                            <label class="preference-option">
                                <input type="checkbox" name="preferences" value="chat-first">
                                <span>💬 Chat prima dell'evento</span>
                            </label>
                            <label class="preference-option">
                                <input type="checkbox" name="preferences" value="split-costs">
                                <span>💰 Dividiamo i costi</span>
                            </label>
                        </div>
                    </div>

                    <div class="group-summary">
                        <h4>📋 Riepilogo Gruppo</h4>
                        <div class="summary-item">
                            <span>Evento:</span>
                            <span>${event.title}</span>
                        </div>
                        <div class="summary-item">
                            <span>Dimensione gruppo:</span>
                            <span id="groupSizeSummary">4 persone</span>
                        </div>
                        <div class="summary-item">
                            <span>Costo per persona:</span>
                            <span>${event.price}€</span>
                        </div>
                    </div>

                    <div class="group-actions">
                        <button class="btn-secondary" onclick="events.closeBookingModal()">
                            Annulla
                        </button>
                        <button class="btn-primary" onclick="events.createGroup('${event.id}')">
                            🚀 Crea Gruppo
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.showModal('Prenota Insieme', modalContent);
        this.bindGroupEvents();
    }

    bindBookingEvents(event) {
        const guestCountInput = document.getElementById('guestCount');
        const totalPriceSpan = document.getElementById('totalPrice');
        const summaryGuests = document.getElementById('summaryGuests');
        const summaryTotal = document.getElementById('summaryTotal');

        if (guestCountInput) {
            guestCountInput.addEventListener('input', () => {
                const count = parseInt(guestCountInput.value) || 1;
                const total = count * event.price;
                
                totalPriceSpan.textContent = `${total}€`;
                summaryGuests.textContent = count;
                summaryTotal.textContent = `${total}€`;
            });
        }
    }

    bindGroupEvents() {
        // Group size selector
        const sizeOptions = document.querySelectorAll('input[name="groupSize"]');
        const customSizeInput = document.getElementById('customGroupSize');
        const groupSizeSummary = document.getElementById('groupSizeSummary');

        sizeOptions.forEach(option => {
            option.addEventListener('change', () => {
                if (option.value === 'custom') {
                    customSizeInput.style.display = 'block';
                    customSizeInput.focus();
                } else {
                    customSizeInput.style.display = 'none';
                    groupSizeSummary.textContent = `${option.value} persone`;
                }
            });
        });

        if (customSizeInput) {
            customSizeInput.addEventListener('input', () => {
                const size = parseInt(customSizeInput.value) || 2;
                groupSizeSummary.textContent = `${size} persone`;
            });
        }

        // Character counter for description
        const descTextarea = document.getElementById('groupDescription');
        const charCount = document.getElementById('descCharCount');

        if (descTextarea && charCount) {
            descTextarea.addEventListener('input', () => {
                charCount.textContent = descTextarea.value.length;
            });
        }
    }

    async confirmBooking(eventId, type) {
        const guestCount = parseInt(document.getElementById('guestCount').value) || 1;
        const specialRequests = document.getElementById('specialRequests').value;

        const bookingData = {
            eventId,
            type,
            guestCount,
            specialRequests,
            userId: 'mock-user-id' // TODO: Get from auth
        };

        try {
            // Show loading
            const confirmBtn = document.querySelector('.booking-actions .btn-primary');
            const originalText = confirmBtn.textContent;
            confirmBtn.textContent = '⏳ Elaborazione...';
            confirmBtn.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Success
            this.showToast('🎉 Prenotazione confermata! Riceverai una email di conferma.', 'success');
            this.closeBookingModal();
            
            // Update event data
            const event = this.events.find(e => e.id === eventId);
            if (event) {
                event.availableSpots -= guestCount;
            }

        } catch (error) {
            this.showToast('Errore durante la prenotazione. Riprova.', 'error');
            console.error('Booking error:', error);
        }
    }

    async createGroup(eventId) {
        const groupName = document.getElementById('groupName').value;
        const groupDescription = document.getElementById('groupDescription').value;
        const groupSizeRadio = document.querySelector('input[name="groupSize"]:checked');
        const customSize = document.getElementById('customGroupSize').value;
        const preferences = Array.from(document.querySelectorAll('input[name="preferences"]:checked')).map(cb => cb.value);

        if (!groupName.trim()) {
            this.showToast('Inserisci un nome per il gruppo', 'warning');
            return;
        }

        const groupSize = groupSizeRadio.value === 'custom' ? parseInt(customSize) : parseInt(groupSizeRadio.value);

        const groupData = {
            eventId,
            name: groupName,
            description: groupDescription,
            size: groupSize,
            preferences,
            createdBy: 'mock-user-id' // TODO: Get from auth
        };

        try {
            // Show loading
            const createBtn = document.querySelector('.group-actions .btn-primary');
            const originalText = createBtn.textContent;
            createBtn.textContent = '⏳ Creazione gruppo...';
            createBtn.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Success
            this.showToast('🎉 Gruppo creato! Altri utenti potranno ora richiedere di unirsi.', 'success');
            this.closeBookingModal();

        } catch (error) {
            this.showToast('Errore durante la creazione del gruppo. Riprova.', 'error');
            console.error('Group creation error:', error);
        }
    }

    showAllEvents() {
        if (!this.isUserLoggedIn()) {
            this.showLoginRequired('vedere tutti gli eventi');
            return;
        }

        window.location.href = 'dashboard.html';
    }

    showEventFilters() {
        const filtersModalContent = `
            <div class="filters-modal-content">
                <h3>🔍 Filtra Eventi per Interessi</h3>
                
                <div class="filter-section">
                    <label>Tipo di Evento</label>
                    <div class="filter-options">
                        <label class="filter-option">
                            <input type="checkbox" name="category" value="electronic">
                            <span>🎵 Electronic</span>
                        </label>
                        <label class="filter-option">
                            <input type="checkbox" name="category" value="aperitivo">
                            <span>🍸 Aperitivo</span>
                        </label>
                        <label class="filter-option">
                            <input type="checkbox" name="category" value="vip">
                            <span>⭐ VIP</span>
                        </label>
                        <label class="filter-option">
                            <input type="checkbox" name="category" value="rooftop">
                            <span>🏙️ Rooftop</span>
                        </label>
                    </div>
                </div>

                <div class="filter-section">
                    <label>Fascia di Prezzo</label>
                    <div class="price-range">
                        <label class="filter-option">
                            <input type="radio" name="price" value="0-20">
                            <span>💰 0€ - 20€</span>
                        </label>
                        <label class="filter-option">
                            <input type="radio" name="price" value="20-40">
                            <span>💰 20€ - 40€</span>
                        </label>
                        <label class="filter-option">
                            <input type="radio" name="price" value="40+">
                            <span>💰 40€+</span>
                        </label>
                    </div>
                </div>

                <div class="filter-actions">
                    <button class="btn-secondary" onclick="events.closeBookingModal()">
                        Annulla
                    </button>
                    <button class="btn-primary" onclick="events.applyFilters()">
                        🔍 Applica Filtri
                    </button>
                </div>
            </div>
        `;

        this.showModal('Filtri Eventi', filtersModalContent);
    }

    applyFilters() {
        const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
        const selectedPrice = document.querySelector('input[name="price"]:checked')?.value;

        this.showToast('Filtri applicati! Redirecting...', 'info');
        this.closeBookingModal();
        
        // In produzione, qui filtreremmo gli eventi e aggiorneremmo la visualizzazione
        setTimeout(() => {
            window.location.href = `dashboard.html#filters=${selectedCategories.join(',')}&price=${selectedPrice}`;
        }, 1000);
    }

    // Modal system
    showModal(title, content) {
        let modal = document.getElementById('eventsModal');
        if (!modal) {
            modal = this.createModal();
        }

        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');

        modalTitle.textContent = title;
        modalBody.innerHTML = content;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'eventsModal';
        modal.className = 'modal events-modal';
        modal.innerHTML = `
            <div class="modal-content events-modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                    <button class="close-btn" onclick="events.closeBookingModal()">&times;</button>
                </div>
                <div class="modal-body"></div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeBookingModal();
            }
        });

        return modal;
    }

    closeBookingModal() {
        const modal = document.getElementById('eventsModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Utility methods
    isUserLoggedIn() {
        // TODO: Check real authentication status
        return window.app && window.app.user;
    }

    showLoginRequired(action) {
        this.showToast(`Accedi per ${action}`, 'info');
        setTimeout(() => {
            if (window.showLoginModal) {
                window.showLoginModal();
            }
        }, 1000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('it-IT', options);
    }

    showToast(message, type = 'info') {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        } else {
            console.log(`Toast [${type}]:`, message);
        }
    }
}

// Global functions for onclick handlers
function bookEvent(eventId) {
    if (window.events) {
        window.events.bookEvent(eventId);
    }
}

function bookTogether(eventId) {
    if (window.events) {
        window.events.bookTogether(eventId);
    }
}

function showAllEvents() {
    if (window.events) {
        window.events.showAllEvents();
    }
}

function showEventFilters() {
    if (window.events) {
        window.events.showEventFilters();
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.events = new EventsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventsManager;
}