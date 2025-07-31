// Ma Che Serata - Main Application JavaScript
class MaCheSerata {
    constructor() {
        this.user = null;
        this.events = [];
        this.init();
    }

    init() {
        this.loadUserState();
        this.bindEvents();
        this.loadMockData();
        this.updateUI();
    }

    loadUserState() {
        const userData = localStorage.getItem('macheserata_user');
        if (userData) {
            try {
                this.user = JSON.parse(userData);
            } catch (e) {
                console.error('Error parsing user data:', e);
                localStorage.removeItem('macheserata_user');
            }
        }
    }

    saveUserState() {
        if (this.user) {
            localStorage.setItem('macheserata_user', JSON.stringify(this.user));
        } else {
            localStorage.removeItem('macheserata_user');
        }
    }

    bindEvents() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', this.toggleMobileMenu);
        }

        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const navContainer = document.querySelector('.nav-container');
                if (navContainer) {
                    navContainer.classList.remove('mobile-menu-open');
                }
            });
        });

        // Intersection Observer for animations
        this.setupIntersectionObserver();
    }

    toggleMobileMenu() {
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            navContainer.classList.toggle('mobile-menu-open');
        }
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements that should animate in
        document.querySelectorAll('.feature-card, .event-card, .stat-card').forEach(el => {
            observer.observe(el);
        });
    }

    loadMockData() {
        this.events = [
            {
                id: 1,
                title: "🎭 Notte Magica al Duomo",
                venue: "Terrazza Duomo",
                date: "2024-01-20",
                time: "22:00",
                price: "25",
                image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=400&h=300&fit=crop",
                description: "Una serata indimenticabile con vista mozzafiato sul Duomo di Milano",
                tags: ["Premium", "Vista", "Cocktail"],
                attendees: 45,
                maxAttendees: 80,
                vibesIndex: 9.2
            },
            {
                id: 2,
                title: "🎵 Electronic Vibes",
                venue: "Club Underground",
                date: "2024-01-21",
                time: "23:30",
                price: "20",
                image: "https://images.unsplash.com/photo-1571266028243-d220c99b4fce?w=400&h=300&fit=crop",
                description: "I migliori DJ della scena elettronica milanese",
                tags: ["Electronic", "DJ Set", "Dancing"],
                attendees: 67,
                maxAttendees: 100,
                vibesIndex: 8.8
            },
            {
                id: 3,
                title: "🍸 Aperitivo Chic",
                venue: "Sky Lounge",
                date: "2024-01-22",
                time: "19:00",
                price: "15",
                image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
                description: "Aperitivo elegante con cocktail signature",
                tags: ["Aperitivo", "Cocktail", "Networking"],
                attendees: 23,
                maxAttendees: 50,
                vibesIndex: 8.5
            },
            {
                id: 4,
                title: "🎤 Live Music Night",
                venue: "Jazz Corner",
                date: "2024-01-23",
                time: "21:00",
                price: "18",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
                description: "Musica dal vivo con artisti emergenti",
                tags: ["Live Music", "Jazz", "Artisti"],
                attendees: 34,
                maxAttendees: 60,
                vibesIndex: 9.0
            }
        ];

        this.renderEvents();
    }

    renderEvents() {
        const eventsContainer = document.getElementById('eventsContainer');
        if (!eventsContainer) return;

        eventsContainer.innerHTML = this.events.map(event => `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}" loading="lazy">
                    <div class="event-overlay">
                        <div class="event-actions">
                            <button class="btn-event-action" onclick="app.shareEvent(${event.id})" title="Condividi">
                                📤
                            </button>
                            <button class="btn-event-action" onclick="app.saveEvent(${event.id})" title="Salva">
                                ❤️
                            </button>
                        </div>
                    </div>
                </div>
                <div class="event-content">
                    <div class="event-header">
                        <h3 class="event-title">${event.title}</h3>
                        <div class="event-price">€${event.price}</div>
                    </div>
                    <div class="event-venue">📍 ${event.venue}</div>
                    <div class="event-datetime">
                        🗓️ ${this.formatDate(event.date)} • ⏰ ${event.time}
                    </div>
                    <p class="event-description">${event.description}</p>
                    <div class="event-tags">
                        ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="event-footer">
                        <div class="event-stats">
                            <span class="attendees">👥 ${event.attendees}/${event.maxAttendees}</span>
                            <span class="vibes-index">🔥 ${event.vibesIndex}</span>
                        </div>
                        <div class="event-actions-bottom">
                            <button class="btn-prenota-insieme" onclick="app.prenotaInsieme(${event.id})">
                                Prenota Insieme
                            </button>
                            <button class="btn-book-event" onclick="app.bookEvent(${event.id})">
                                Prenota
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'short'
        });
    }

    // Event Actions
    bookEvent(eventId) {
        if (!this.user) {
            this.showToast('Effettua il login per prenotare eventi', 'warning');
            showLoginModal();
            return;
        }

        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        // Simulate booking
        this.showToast(`Prenotazione confermata per "${event.title}"!`, 'success');
        
        // Update event attendees (mock)
        event.attendees++;
        this.renderEvents();
    }

    prenotaInsieme(eventId) {
        if (!this.user) {
            this.showToast('Effettua il login per utilizzare "Prenota Insieme"', 'warning');
            showLoginModal();
            return;
        }

        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        this.showToast(`Richiesta "Prenota Insieme" inviata per "${event.title}"!`, 'info');
    }

    shareEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: event.description,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            const shareText = `${event.title} - ${event.description} ${window.location.href}`;
            navigator.clipboard.writeText(shareText).then(() => {
                this.showToast('Link copiato negli appunti!', 'success');
            });
        }
    }

    saveEvent(eventId) {
        if (!this.user) {
            this.showToast('Effettua il login per salvare eventi', 'warning');
            showLoginModal();
            return;
        }

        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        // Toggle saved state (mock)
        const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
        const saveBtn = eventCard.querySelector('.btn-event-action[title="Salva"]');
        
        if (saveBtn.textContent === '❤️') {
            saveBtn.textContent = '💖';
            saveBtn.style.color = '#ff6b6b';
            this.showToast('Evento salvato nei preferiti!', 'success');
        } else {
            saveBtn.textContent = '❤️';
            saveBtn.style.color = '';
            this.showToast('Evento rimosso dai preferiti', 'info');
        }
    }

    // User Management
    loginUser(userData) {
        this.user = userData;
        this.saveUserState();
        this.updateUI();
        
        // Redirect based on role
        setTimeout(() => {
            this.redirectBasedOnRole();
        }, 1500);
    }

    logoutUser() {
        this.user = null;
        this.saveUserState();
        this.updateUI();
        this.showToast('Logout effettuato con successo', 'success');
        
        // Redirect to home if on protected pages
        if (window.location.pathname.includes('admin') || window.location.pathname.includes('dashboard')) {
            window.location.href = 'index.html';
        }
    }

    redirectBasedOnRole() {
        if (!this.user) return;

        const roleRedirects = {
            'admin': 'admin.html',
            'venue': 'dashboard.html?role=venue',
            'artist': 'dashboard.html?role=artist',
            'pr': 'dashboard.html?role=pr',
            'matcher': 'dashboard.html?role=matcher'
        };

        const redirectUrl = roleRedirects[this.user.role] || 'dashboard.html';
        
        this.showToast(`Benvenuto ${this.user.username}! Reindirizzamento...`, 'success');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 2000);
    }

    updateUI() {
        const loginBtn = document.querySelector('.btn-login');
        const registerBtn = document.querySelector('.btn-register');
        const navLinks = document.querySelector('.nav-links');

        if (this.user) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            
            // Add user menu if not exists
            let userMenu = document.querySelector('.user-menu');
            if (!userMenu && navLinks) {
                userMenu = document.createElement('div');
                userMenu.className = 'user-menu';
                userMenu.innerHTML = `
                    <div class="user-avatar" onclick="app.toggleUserDropdown()">
                        <span>${this.user.username[0].toUpperCase()}</span>
                    </div>
                    <div class="user-dropdown" id="userDropdown">
                        <div class="user-info">
                            <strong>${this.user.username}</strong>
                            <small>${this.user.role}</small>
                        </div>
                        <hr>
                        <a href="dashboard.html">🏠 Dashboard</a>
                        <a href="flir2night.html">💬 Flir2night</a>
                        ${this.user.role === 'admin' ? '<a href="admin.html">👑 Admin</a>' : ''}
                        <hr>
                        <a href="#" onclick="app.logoutUser()">🚪 Logout</a>
                    </div>
                `;
                navLinks.appendChild(userMenu);
            }
        } else {
            // User is not logged in
            if (loginBtn) loginBtn.style.display = '';
            if (registerBtn) registerBtn.style.display = '';
            
            const userMenu = document.querySelector('.user-menu');
            if (userMenu) userMenu.remove();
        }
    }

    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

  // Toast Notifications
showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) {
        alert(message); // Fallback se toast non esiste
        return;
    }
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

    // API Helper
    async apiCall(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (this.user && this.user.token) {
            defaultOptions.headers.Authorization = `Bearer ${this.user.token}`;
        }

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`/api${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API Error');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            this.showToast(error.message || 'Errore di connessione', 'error');
            throw error;
        }
    }
}

// Modal Management
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Global function for mobile menu toggle
function toggleMobileMenu() {
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        navContainer.classList.toggle('mobile-menu-open');
    }
}

// Global logout function
function logout() {
    if (window.app) {
        window.app.logoutUser();
    }
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = '';
    }
});

// Close user dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MaCheSerata();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaCheSerata;
}

// Password visibility toggle
function togglePasswordVisibility(event) {
    const button = event.target;
    const input = button.parentNode.querySelector('input');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}
// Fix iOS touch events
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        // Aggiungi event listener per touch (iOS)
        mobileToggle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            toggleMobileMenu();
        });
        
        // Mantieni anche click per desktop
        mobileToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMobileMenu();
        });
    }
});
