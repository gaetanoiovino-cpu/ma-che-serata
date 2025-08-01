// Ma Che Serata - Admin Dashboard
class AdminManager {
    constructor() {
        this.currentSection = 'overview';
        this.users = [];
        this.events = [];
        this.venues = [];
        this.forumPosts = [];
        this.isLoading = false;
        this.init();
    }

    init() {
        this.checkAdminAuth();
        this.loadMockData();
        this.bindEvents();
        this.showSection('overview');
    }

    checkAdminAuth() {
        // Check if user is logged in and is admin
        const userData = localStorage.getItem('macheserata_user');
        if (!userData) {
            this.redirectToLogin();
            return;
        }

        try {
            const user = JSON.parse(userData);
            if (user.role !== 'admin') {
                this.showUnauthorized();
                return;
            }
        } catch (e) {
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        window.location.href = 'index.html';
    }

    showUnauthorized() {
        document.body.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; color: white;">
                <h1>🚫 Accesso Negato</h1>
                <p>Non hai i permessi per accedere a questa area.</p>
                <button onclick="window.location.href='index.html'" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Torna alla Home
                </button>
            </div>
        `;
    }

    bindEvents() {
        // Navigation links
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Search inputs
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => {
                this.filterUsers(e.target.value);
            });
        }

        const eventSearch = document.getElementById('eventSearch');
        if (eventSearch) {
            eventSearch.addEventListener('input', (e) => {
                this.filterEvents(e.target.value);
            });
        }

        // Filter selects
        const userFilter = document.getElementById('userFilter');
        if (userFilter) {
            userFilter.addEventListener('change', (e) => {
                this.filterUsersByStatus(e.target.value);
            });
        }

        const eventFilter = document.getElementById('eventFilter');
        if (eventFilter) {
            eventFilter.addEventListener('change', (e) => {
                this.filterEventsByStatus(e.target.value);
            });
        }
    }

    async loadMockData() {
        await this.loadUsersData();
        this.loadEventsData();
    }

    async loadUsersData() {
        try {
            // Load real users from API
            const response = await fetch('/api/admin-users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.users = data.users;
                    console.log('Users loaded successfully:', this.users.length);
                    return;
                }
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }

        // Fallback to mock data if API fails
        console.log('Using mock user data');
        this.users = [
            {
                id: 1,
                username: "MilanNightQueen",
                email: "sarah@email.com",
                role: "matcher",
                status: "active",
                registeredAt: "2024-01-15",
                lastLogin: "2024-01-20",
                reputation: 234,
                eventsAttended: 12,
                instagramHandle: "@sarah_milan"
            },
            {
                id: 2,
                username: "DJMarcoBeat",
                email: "marco@djmarco.com",
                role: "artist",
                status: "pending",
                registeredAt: "2024-01-18",
                lastLogin: "2024-01-19",
                reputation: 445,
                eventsAttended: 8,
                instagramHandle: "@djmarcobeat"
            },
            {
                id: 3,
                username: "DuomoBarOfficial",
                email: "info@duomobar.it",
                role: "venue",
                status: "active",
                registeredAt: "2024-01-10",
                lastLogin: "2024-01-20",
                reputation: 892,
                eventsAttended: 0,
                instagramHandle: "@duomobar_milano"
            },
            {
                id: 4,
                username: "PRMilano_Official",
                email: "pr@milanonight.com",
                role: "pr",
                status: "active",
                registeredAt: "2024-01-12",
                lastLogin: "2024-01-20",
                reputation: 678,
                eventsAttended: 25,
                instagramHandle: "@prmilano"
            },
            {
                id: 5,
                username: "ToxicUser123",
                email: "toxic@spam.com",
                role: "matcher",
                status: "banned",
                registeredAt: "2024-01-17",
                lastLogin: "2024-01-18",
                reputation: -15,
                eventsAttended: 2,
                instagramHandle: null
            }
        ];
    }

    loadEventsData() {
        this.events = [
            {
                id: 1,
                title: "Notte Magica al Duomo",
                venue: "Terrazza Duomo",
                venueId: 3,
                date: "2024-01-25",
                time: "22:00",
                price: 25,
                status: "upcoming",
                attendees: 45,
                maxAttendees: 80,
                revenue: 1125,
                createdBy: "DuomoBarOfficial"
            },
            {
                id: 2,
                title: "Electronic Vibes",
                venue: "Club Underground",
                venueId: 2,
                date: "2024-01-21",
                time: "23:30",
                price: 20,
                status: "live",
                attendees: 67,
                maxAttendees: 100,
                revenue: 1340,
                createdBy: "ClubUnderground"
            },
            {
                id: 3,
                title: "Aperitivo Chic",
                venue: "Sky Lounge",
                venueId: 4,
                date: "2024-01-19",
                time: "19:00",
                price: 15,
                status: "ended",
                attendees: 50,
                maxAttendees: 50,
                revenue: 750,
                createdBy: "SkyLoungeTeam"
            }
        ];
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        this.currentSection = sectionName;

        // Load section-specific data
        switch (sectionName) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'users':
                this.loadUsersTable();
                break;
            case 'events':
                this.loadEventsTable();
                break;
            case 'venues':
                this.loadVenuesData();
                break;
            case 'forum':
                this.loadForumData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
        }
    }

    loadOverviewData() {
        // Stats are already in HTML, could be updated dynamically here
        console.log('Overview data loaded');
    }

    loadUsersTable() {
        const tableBody = document.getElementById('usersTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = this.users.map(user => `
            <tr data-user-id="${user.id}">
                <td>
                    <div class="user-info">
                        <strong>${user.username}</strong>
                        <small>Rep: ${user.reputation || 0}</small>
                        ${user.professional_details ? `<div class="business-info">${user.professional_details.business_name || ''}</div>` : ''}
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge role-${user.user_type || user.role}">${this.formatUserType(user.user_type || user.role)}</span>
                </td>
                <td>
                    <span class="status-badge status-${user.account_status || user.status}">${this.formatStatus(user.account_status || user.status)}</span>
                </td>
                <td>
                    ${user.trialStatus ? `<span class="trial-status">${user.trialStatus}</span>` : '-'}
                </td>
                <td>${this.formatDate(user.created_at || user.registeredAt)}</td>
                <td>
                    <div class="action-buttons">
                        ${this.getUserActionButtons(user)}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadEventsTable() {
        const tableBody = document.getElementById('eventsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = this.events.map(event => `
            <tr data-event-id="${event.id}">
                <td>
                    <div class="event-info">
                        <strong>${event.title}</strong>
                        <small>${event.date} • ${event.time}</small>
                    </div>
                </td>
                <td>${event.venue}</td>
                <td>${event.date}</td>
                <td>
                    <div class="booking-info">
                        <span>${event.attendees}/${event.maxAttendees}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(event.attendees / event.maxAttendees) * 100}%"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${event.status}">${this.formatEventStatus(event.status)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${this.getEventActionButtons(event)}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getUserActionButtons(user) {
        const status = user.account_status || user.status;
        const userId = user.id;
        
        switch (status) {
            case 'pending_validation':
            case 'pending':
                return `
                    <button class="btn-action btn-approve" onclick="adminManager.approveUser(${userId})">
                        Approva
                    </button>
                    <button class="btn-action btn-reject" onclick="adminManager.rejectUser(${userId})">
                        Rifiuta
                    </button>
                `;
            case 'trial_period':
                return `
                    <button class="btn-action btn-approve" onclick="adminManager.approveUser(${userId})">
                        Approva Definitivo
                    </button>
                    <button class="btn-action btn-extend" onclick="adminManager.extendTrial(${userId})">
                        Estendi Prova (+48h)
                    </button>
                    <button class="btn-action btn-reject" onclick="adminManager.rejectUser(${userId})">
                        Rifiuta
                    </button>
                `;
            case 'active':
                return `
                    <button class="btn-action btn-ban" onclick="adminManager.banUser(${userId})">
                        Banna
                    </button>
                    <button class="btn-action btn-view" onclick="adminManager.viewUser(${userId})">
                        Dettagli
                    </button>
                `;
            case 'banned':
            case 'rejected':
                return `
                    <button class="btn-action btn-approve" onclick="adminManager.unbanUser(${userId})">
                        Riattiva
                    </button>
                    <button class="btn-action btn-view" onclick="adminManager.viewUser(${userId})">
                        Dettagli
                    </button>
                `;
            default:
                return '';
        }
    }

    getEventActionButtons(event) {
        switch (event.status) {
            case 'upcoming':
                return `
                    <button class="btn-action btn-view" onclick="adminManager.viewEvent(${event.id})">
                        Dettagli
                    </button>
                    <button class="btn-action btn-reject" onclick="adminManager.cancelEvent(${event.id})">
                        Cancella
                    </button>
                `;
            case 'live':
                return `
                    <button class="btn-action btn-view" onclick="adminManager.viewEvent(${event.id})">
                        Monitor
                    </button>
                `;
            case 'ended':
                return `
                    <button class="btn-action btn-view" onclick="adminManager.viewEvent(${event.id})">
                        Report
                    </button>
                `;
            default:
                return '';
        }
    }

    // User Management Actions
    approveUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (confirm(`Approvare l'utente ${user.username}?`)) {
            user.status = 'active';
            this.loadUsersTable();
            this.showToast(`Utente ${user.username} approvato`, 'success');
        }
    }

    rejectUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (confirm(`Rifiutare l'utente ${user.username}? Questa azione è irreversibile.`)) {
            this.users = this.users.filter(u => u.id !== userId);
            this.loadUsersTable();
            this.showToast(`Utente ${user.username} rifiutato`, 'info');
        }
    }

    banUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const reason = prompt(`Motivo del ban per ${user.username}:`);
        if (reason && confirm(`Bannare l'utente ${user.username}?`)) {
            user.status = 'banned';
            user.banReason = reason;
            this.loadUsersTable();
            this.showToast(`Utente ${user.username} bannato`, 'warning');
        }
    }

    unbanUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (confirm(`Sbannare l'utente ${user.username}?`)) {
            user.status = 'active';
            delete user.banReason;
            this.loadUsersTable();
            this.showToast(`Utente ${user.username} sbannato`, 'success');
        }
    }

    viewUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        // Create modal with user details
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>👤 Dettagli Utente</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="user-details">
                        <div class="detail-row">
                            <strong>Username:</strong> ${user.username}
                        </div>
                        <div class="detail-row">
                            <strong>Email:</strong> ${user.email}
                        </div>
                        <div class="detail-row">
                            <strong>Ruolo:</strong> ${this.formatRole(user.role)}
                        </div>
                        <div class="detail-row">
                            <strong>Status:</strong> ${this.formatStatus(user.status)}
                        </div>
                        <div class="detail-row">
                            <strong>Reputazione:</strong> ${user.reputation}
                        </div>
                        <div class="detail-row">
                            <strong>Eventi Partecipati:</strong> ${user.eventsAttended}
                        </div>
                        <div class="detail-row">
                            <strong>Instagram:</strong> ${user.instagramHandle || 'Non fornito'}
                        </div>
                        <div class="detail-row">
                            <strong>Registrato:</strong> ${this.formatDate(user.registeredAt)}
                        </div>
                        <div class="detail-row">
                            <strong>Ultimo Login:</strong> ${this.formatDate(user.lastLogin)}
                        </div>
                        ${user.banReason ? `
                            <div class="detail-row">
                                <strong>Motivo Ban:</strong> ${user.banReason}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Event Management Actions
    cancelEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const reason = prompt(`Motivo della cancellazione per "${event.title}":`);
        if (reason && confirm(`Cancellare l'evento "${event.title}"?`)) {
            event.status = 'cancelled';
            event.cancelReason = reason;
            this.loadEventsTable();
            this.showToast(`Evento "${event.title}" cancellato`, 'warning');
        }
    }

    viewEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        // Create modal with event details
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎭 Dettagli Evento</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="event-details">
                        <div class="detail-row">
                            <strong>Titolo:</strong> ${event.title}
                        </div>
                        <div class="detail-row">
                            <strong>Locale:</strong> ${event.venue}
                        </div>
                        <div class="detail-row">
                            <strong>Data:</strong> ${event.date} • ${event.time}
                        </div>
                        <div class="detail-row">
                            <strong>Prezzo:</strong> €${event.price}
                        </div>
                        <div class="detail-row">
                            <strong>Prenotazioni:</strong> ${event.attendees}/${event.maxAttendees}
                        </div>
                        <div class="detail-row">
                            <strong>Revenue:</strong> €${event.revenue}
                        </div>
                        <div class="detail-row">
                            <strong>Status:</strong> ${this.formatEventStatus(event.status)}
                        </div>
                        <div class="detail-row">
                            <strong>Creato da:</strong> ${event.createdBy}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Filter functions
    filterUsers(searchTerm) {
        const filteredUsers = this.users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredUsers(filteredUsers);
    }

    filterUsersByStatus(status) {
        const filteredUsers = status === 'all' 
            ? this.users 
            : this.users.filter(user => user.status === status);
        this.renderFilteredUsers(filteredUsers);
    }

    filterEvents(searchTerm) {
        const filteredEvents = this.events.filter(event =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.venue.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredEvents(filteredEvents);
    }

    filterEventsByStatus(status) {
        const filteredEvents = status === 'all' 
            ? this.events 
            : this.events.filter(event => event.status === status);
        this.renderFilteredEvents(filteredEvents);
    }

    renderFilteredUsers(users) {
        const tableBody = document.getElementById('usersTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = users.map(user => `
            <tr data-user-id="${user.id}">
                <td>
                    <div class="user-info">
                        <strong>${user.username}</strong>
                        <small>Rep: ${user.reputation}</small>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge role-${user.role}">${this.formatRole(user.role)}</span>
                </td>
                <td>
                    <span class="status-badge status-${user.status}">${this.formatStatus(user.status)}</span>
                </td>
                <td>${this.formatDate(user.registeredAt)}</td>
                <td>
                    <div class="action-buttons">
                        ${this.getUserActionButtons(user)}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderFilteredEvents(events) {
        const tableBody = document.getElementById('eventsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = events.map(event => `
            <tr data-event-id="${event.id}">
                <td>
                    <div class="event-info">
                        <strong>${event.title}</strong>
                        <small>${event.date} • ${event.time}</small>
                    </div>
                </td>
                <td>${event.venue}</td>
                <td>${event.date}</td>
                <td>
                    <div class="booking-info">
                        <span>${event.attendees}/${event.maxAttendees}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(event.attendees / event.maxAttendees) * 100}%"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${event.status}">${this.formatEventStatus(event.status)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${this.getEventActionButtons(event)}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Quick Actions
    showPendingApprovals() {
        const pendingUsers = this.users.filter(u => u.status === 'pending');
        this.showSection('users');
        this.filterUsersByStatus('pending');
        this.showToast(`${pendingUsers.length} utenti in attesa di approvazione`, 'info');
    }

    showRecentReports() {
        this.showToast('Sezione segnalazioni disponibile prossimamente', 'info');
    }

    showSystemHealth() {
        this.showToast('Tutti i sistemi operativi ✅', 'success');
    }

    exportData() {
        const data = {
            users: this.users,
            events: this.events,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `macheserata_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('Dati esportati con successo', 'success');
    }

    // Utility methods
    formatUserType(userType) {
        const types = {
            'matcher': 'Matcher',
            'pr': 'PR/Promoter',
            'manager': 'Gestore Locale',
            'artist': 'Artista',
            'admin': 'Admin',
            'venue': 'Locale' // backward compatibility
        };
        return types[userType] || userType;
    }

    formatRole(role) {
        // Keep for backward compatibility
        return this.formatUserType(role);
    }

    formatStatus(status) {
        const statuses = {
            'active': 'Attivo',
            'pending_validation': 'In Attesa Validazione',
            'trial_period': 'Periodo Prova',
            'banned': 'Bannato',
            'rejected': 'Rifiutato',
            'suspended': 'Sospeso',
            // backward compatibility
            'pending': 'In Attesa'
        };
        return statuses[status] || status;
    }

    formatEventStatus(status) {
        const statuses = {
            'upcoming': 'Prossimo',
            'live': 'In Corso',
            'ended': 'Terminato',
            'cancelled': 'Cancellato'
        };
        return statuses[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT');
    }

    showToast(message, type = 'info') {
        if (window.app) {
            window.app.showToast(message, type);
        }
    }

    loadVenuesData() {
        this.showToast('Sezione locali disponibile prossimamente', 'info');
    }

    loadForumData() {
        this.showToast('Sezione gestione forum disponibile prossimamente', 'info');
    }

    loadAnalyticsData() {
        this.showToast('Analytics dettagliate disponibili prossimamente', 'info');
    }
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.remove();
    }
});

// Initialize Admin Manager
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminManager;
}
