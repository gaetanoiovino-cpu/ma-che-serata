class DashboardRouter {
    constructor() {
        this.userType = null;
        this.dashboardRoutes = {
            'matcher': 'dashboard.html',
            'pr': 'pr-dashboard.html', 
            'manager': 'manager-dashboard.html',
            'artist': 'artist-dashboard.html'
        };
        this.init();
    }

    init() {
        console.log('Dashboard Router inizializzato');
        this.checkUserAuthentication();
    }

    async checkUserAuthentication() {
        try {
            // Controlla se l'utente è autenticato
            const user = this.getCurrentUser();
            
            if (!user) {
                // Se non autenticato, reindirizza alla home
                this.redirectToHome();
                return;
            }
            
            // Se autenticato, ottieni il tipo di utente
            this.userType = await this.getUserType(user);
            
            // Reindirizza alla dashboard corretta
            this.routeToDashboard();
            
        } catch (error) {
            console.error('Errore nel controllo autenticazione:', error);
            this.redirectToHome();
        }
    }

    getCurrentUser() {
        // Simuliamo il controllo dell'utente corrente
        // In un'implementazione reale, questo controllerebbe il token JWT o session storage
        const mockUser = localStorage.getItem('currentUser');
        return mockUser ? JSON.parse(mockUser) : null;
    }

    async getUserType(user) {
        try {
            // In un'implementazione reale, questo farebbe una chiamata API
            // Per ora simuliamo con dati mock
            
            // Se l'utente ha già un tipo salvato localmente
            if (user.user_type) {
                return user.user_type;
            }
            
            // Altrimenti fai una chiamata API per ottenerlo
            const response = await fetch('/api/get-user-profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                return userData.user_type;
            }
            
            // Default fallback
            return 'matcher';
            
        } catch (error) {
            console.error('Errore nel recupero tipo utente:', error);
            return 'matcher'; // Default fallback
        }
    }

    routeToDashboard() {
        const currentPage = window.location.pathname.split('/').pop();
        const targetDashboard = this.dashboardRoutes[this.userType];
        
        // Se siamo già nella dashboard corretta, non reindirizzare
        if (currentPage === targetDashboard) {
            console.log(`Già nella dashboard corretta: ${targetDashboard}`);
            return;
        }
        
        // Se siamo in una dashboard diversa o in una pagina generica, reindirizza
        if (this.isDashboardPage(currentPage) || this.shouldRedirectToDashboard(currentPage)) {
            console.log(`Reindirizzando da ${currentPage} a ${targetDashboard}`);
            window.location.href = targetDashboard;
        }
    }

    isDashboardPage(page) {
        const dashboardPages = Object.values(this.dashboardRoutes);
        return dashboardPages.includes(page);
    }

    shouldRedirectToDashboard(page) {
        // Pagine da cui reindirizzare automaticamente alla dashboard
        const redirectPages = ['index.html', 'dashboard.html', ''];
        return redirectPages.includes(page);
    }

    redirectToHome() {
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'index.html' && currentPage !== '') {
            console.log('Reindirizzando alla home per utente non autenticato');
            window.location.href = 'index.html';
        }
    }

    // Metodo per il login che salva il tipo utente
    async handleSuccessfulLogin(userData) {
        try {
            // Salva i dati utente nel localStorage
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Determina il tipo di utente
            this.userType = userData.user_type || 'matcher';
            
            // Aggiorna i dati utente con il tipo se non presente
            if (!userData.user_type) {
                userData.user_type = this.userType;
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }
            
            // Mostra toast di benvenuto
            const welcomeMessage = this.getWelcomeMessage(this.userType);
            window.app.showToast(welcomeMessage, 'success');
            
            // Attendi un momento per mostrare il toast, poi reindirizza
            setTimeout(() => {
                this.routeToDashboard();
            }, 1500);
            
        } catch (error) {
            console.error('Errore nel login:', error);
            window.app.showToast('Errore nel login', 'error');
        }
    }

    getWelcomeMessage(userType) {
        const messages = {
            'matcher': '🎭 Benvenuto! Scopri gli eventi più cool della città!',
            'pr': '📢 Benvenuto nella tua StagePass Dashboard!',
            'manager': '🏢 Benvenuto nella tua Spotlight Dashboard!',
            'artist': '🎵 Benvenuto nella tua Performer Dashboard!'
        };
        
        return messages[userType] || '🎭 Benvenuto su Ma Che Serata!';
    }

    // Metodo per il logout
    handleLogout() {
        // Rimuovi i dati utente
        localStorage.removeItem('currentUser');
        
        // Reindirizza alla home
        window.location.href = 'index.html';
        
        // Mostra messaggio di logout
        setTimeout(() => {
            window.app.showToast('Logout effettuato con successo', 'info');
        }, 100);
    }

    // Metodi di utilità per verifiche rapide
    isUserAuthenticated() {
        return !!this.getCurrentUser();
    }

    getUserDashboardUrl() {
        if (!this.userType) return 'index.html';
        return this.dashboardRoutes[this.userType] || 'dashboard.html';
    }

    // Metodo per gestire i cambio di ruolo (upgrade account)
    async handleUserTypeChange(newUserType) {
        try {
            const currentUser = this.getCurrentUser();
            if (currentUser) {
                currentUser.user_type = newUserType;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                this.userType = newUserType;
                
                // Mostra messaggio di aggiornamento
                const upgradeMessage = `🎉 Account aggiornato a ${this.formatUserType(newUserType)}!`;
                window.app.showToast(upgradeMessage, 'success');
                
                // Reindirizza alla nuova dashboard
                setTimeout(() => {
                    this.routeToDashboard();
                }, 2000);
            }
        } catch (error) {
            console.error('Errore nel cambio tipo utente:', error);
            window.app.showToast('Errore nell\'aggiornamento account', 'error');
        }
    }

    formatUserType(userType) {
        const types = {
            'matcher': 'Matcher',
            'pr': 'PR/Promoter',
            'manager': 'Gestore Locale',
            'artist': 'Artista/DJ'
        };
        
        return types[userType] || 'Utente';
    }

    // Metodo per creare link di navigazione personalizzati
    createNavigationLinks() {
        const nav = document.querySelector('.nav-links');
        if (!nav || !this.isUserAuthenticated()) return;

        // Rimuovi link esistenti delle dashboard
        const existingDashboardLinks = nav.querySelectorAll('[data-dashboard-link]');
        existingDashboardLinks.forEach(link => link.remove());

        // Aggiungi link alla dashboard corretta
        const dashboardUrl = this.getUserDashboardUrl();
        const dashboardName = this.getDashboardName(this.userType);
        
        const dashboardLink = document.createElement('a');
        dashboardLink.href = dashboardUrl;
        dashboardLink.textContent = dashboardName;
        dashboardLink.setAttribute('data-dashboard-link', 'true');
        dashboardLink.className = 'dashboard-link';
        
        // Inserisci prima del link logout se esiste
        const logoutLink = nav.querySelector('[onclick*="logout"]');
        if (logoutLink) {
            nav.insertBefore(dashboardLink, logoutLink);
        } else {
            nav.appendChild(dashboardLink);
        }
    }

    getDashboardName(userType) {
        const names = {
            'matcher': 'Dashboard',
            'pr': 'StagePass',
            'manager': 'Spotlight',
            'artist': 'Performer'
        };
        
        return names[userType] || 'Dashboard';
    }

    // Metodo per controlli di autorizzazione per pagine specifiche
    checkPageAuthorization(requiredUserType) {
        const currentUser = this.getCurrentUser();
        
        if (!currentUser) {
            this.redirectToHome();
            return false;
        }
        
        if (requiredUserType && currentUser.user_type !== requiredUserType) {
            window.app.showToast('Non hai i permessi per accedere a questa pagina', 'error');
            this.routeToDashboard();
            return false;
        }
        
        return true;
    }
}

// Crea istanza globale del router
let dashboardRouter;

// Inizializza il router quando il DOM è caricato
document.addEventListener('DOMContentLoaded', () => {
    dashboardRouter = new DashboardRouter();
    
    // Aggiorna i link di navigazione
    setTimeout(() => {
        dashboardRouter.createNavigationLinks();
    }, 100);
});

// Estendi il sistema di autenticazione esistente
if (window.AuthSystem) {
    // Override del metodo di login per integrare il routing
    const originalHandleLogin = window.AuthSystem.prototype.handleLogin;
    window.AuthSystem.prototype.handleLogin = async function(formData) {
        try {
            // Esegui il login originale
            const result = await originalHandleLogin.call(this, formData);
            
            // Se il login ha successo, gestisci il routing
            if (result && result.success) {
                await dashboardRouter.handleSuccessfulLogin(result.user);
            }
            
            return result;
        } catch (error) {
            console.error('Errore nel login con routing:', error);
            throw error;
        }
    };
}

// Funzione globale per logout che integra il routing
function logout() {
    if (dashboardRouter) {
        dashboardRouter.handleLogout();
    } else {
        // Fallback se il router non è disponibile
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Aggiungi utility per simulare login per test
window.simulateLogin = function(userType = 'matcher') {
    const mockUser = {
        id: Math.floor(Math.random() * 1000),
        username: `test_${userType}`,
        email: `test@${userType}.com`,
        user_type: userType,
        token: 'mock_token_' + Date.now()
    };
    
    dashboardRouter.handleSuccessfulLogin(mockUser);
};

// Aggiungi utility per simulare cambio tipo utente
window.changeUserType = function(newUserType) {
    if (dashboardRouter) {
        dashboardRouter.handleUserTypeChange(newUserType);
    }
};

// Export per uso in altri moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardRouter;
}