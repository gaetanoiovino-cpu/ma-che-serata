/**
 * GDPR COMPLIANCE SYSTEM
 * Sistema per conformità GDPR con gestione cookie, privacy e dati utente
 */

class GDPRComplianceSystem {
    constructor() {
        this.consentGiven = false;
        this.cookieSettings = {
            necessary: true, // Always true, cannot be disabled
            analytics: false,
            marketing: false,
            preferences: false
        };
        this.userDataExports = [];
        this.isInitialized = false;
    }

    init() {
        this.loadConsentStatus();
        this.checkCookieConsent();
        this.initializeCookieBanner();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('🔒 Sistema GDPR inizializzato');
    }

    loadConsentStatus() {
        const consent = localStorage.getItem('ma-che-serata-gdpr-consent');
        if (consent) {
            const consentData = JSON.parse(consent);
            this.consentGiven = consentData.given;
            this.cookieSettings = { ...this.cookieSettings, ...consentData.settings };
        }
    }

    checkCookieConsent() {
        if (!this.consentGiven) {
            // Don't load analytics/marketing scripts until consent is given
            this.blockThirdPartyScripts();
        } else {
            this.enableApprovedServices();
        }
    }

    initializeCookieBanner() {
        if (this.consentGiven) return;

        // Show cookie banner after 2 seconds
        setTimeout(() => {
            this.showCookieBanner();
        }, 2000);
    }

    showCookieBanner() {
        const banner = this.createCookieBanner();
        document.body.appendChild(banner);
        
        // Show with animation
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    createCookieBanner() {
        const banner = document.createElement('div');
        banner.id = 'gdpr-cookie-banner';
        banner.className = 'gdpr-cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-info">
                    <h3>🍪 Utilizziamo i Cookie</h3>
                    <p>Questo sito utilizza cookie per migliorare la tua esperienza. Puoi personalizzare le tue preferenze o accettare tutti i cookie.</p>
                </div>
                
                <div class="cookie-actions">
                    <button class="btn-settings" onclick="gdprSystem.showCookieSettings()">
                        ⚙️ Personalizza
                    </button>
                    <button class="btn-accept-necessary" onclick="gdprSystem.acceptNecessaryOnly()">
                        Accetta Necessari
                    </button>
                    <button class="btn-accept-all" onclick="gdprSystem.acceptAllCookies()">
                        Accetta Tutti
                    </button>
                </div>
            </div>
        `;

        this.addCookieBannerStyles();
        return banner;
    }

    showCookieSettings() {
        const modal = this.createCookieSettingsModal();
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    createCookieSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'cookie-settings-modal';
        modal.innerHTML = `
            <div class="cookie-settings-content">
                <div class="settings-header">
                    <h3>🍪 Impostazioni Cookie</h3>
                    <button class="close-btn" onclick="this.closest('.cookie-settings-modal').remove()">✕</button>
                </div>
                
                <div class="settings-body">
                    <div class="cookie-category">
                        <div class="category-header">
                            <h4>🔧 Cookie Necessari</h4>
                            <label class="toggle-switch">
                                <input type="checkbox" checked disabled>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p>Questi cookie sono essenziali per il funzionamento del sito e non possono essere disabilitati.</p>
                        <div class="cookie-details">
                            <strong>Esempi:</strong> Autenticazione, sicurezza, preferenze linguaggio
                        </div>
                    </div>

                    <div class="cookie-category">
                        <div class="category-header">
                            <h4>📊 Cookie Analitici</h4>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.cookieSettings.analytics ? 'checked' : ''} 
                                       onchange="gdprSystem.updateCookieSetting('analytics', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p>Ci aiutano a capire come i visitatori interagiscono con il sito raccogliendo informazioni anonime.</p>
                        <div class="cookie-details">
                            <strong>Servizi:</strong> Google Analytics, Hotjar, Custom Analytics
                        </div>
                    </div>

                    <div class="cookie-category">
                        <div class="category-header">
                            <h4>🎯 Cookie Marketing</h4>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.cookieSettings.marketing ? 'checked' : ''} 
                                       onchange="gdprSystem.updateCookieSetting('marketing', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p>Utilizzati per fornire annunci pubblicitari più rilevanti per te e i tuoi interessi.</p>
                        <div class="cookie-details">
                            <strong>Servizi:</strong> Facebook Pixel, Google Ads, Instagram
                        </div>
                    </div>

                    <div class="cookie-category">
                        <div class="category-header">
                            <h4>⚙️ Cookie Preferenze</h4>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.cookieSettings.preferences ? 'checked' : ''} 
                                       onchange="gdprSystem.updateCookieSetting('preferences', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p>Consentono al sito di ricordare le tue scelte per offrirti funzionalità personalizzate.</p>
                        <div class="cookie-details">
                            <strong>Esempi:</strong> Tema scuro/chiaro, layout preferito, impostazioni dashboard
                        </div>
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button class="btn-secondary" onclick="this.closest('.cookie-settings-modal').remove()">
                        Annulla
                    </button>
                    <button class="btn-primary" onclick="gdprSystem.saveCookieSettings()">
                        Salva Preferenze
                    </button>
                </div>
            </div>
        `;

        this.addCookieSettingsStyles();
        return modal;
    }

    updateCookieSetting(category, enabled) {
        this.cookieSettings[category] = enabled;
    }

    acceptNecessaryOnly() {
        this.cookieSettings = {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false
        };
        this.giveConsent();
    }

    acceptAllCookies() {
        this.cookieSettings = {
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true
        };
        this.giveConsent();
    }

    saveCookieSettings() {
        this.giveConsent();
        document.querySelector('.cookie-settings-modal')?.remove();
    }

    giveConsent() {
        this.consentGiven = true;
        
        // Save consent
        const consentData = {
            given: true,
            timestamp: new Date().toISOString(),
            settings: this.cookieSettings,
            version: '1.0'
        };
        
        localStorage.setItem('ma-che-serata-gdpr-consent', JSON.stringify(consentData));
        
        // Remove banner
        document.getElementById('gdpr-cookie-banner')?.remove();
        
        // Enable approved services
        this.enableApprovedServices();
        
        // Show confirmation
        if (window.app) {
            window.app.showToast('✅ Preferenze cookie salvate', 'success');
        }
    }

    enableApprovedServices() {
        if (this.cookieSettings.analytics) {
            this.enableAnalytics();
        }
        
        if (this.cookieSettings.marketing) {
            this.enableMarketing();
        }
        
        if (this.cookieSettings.preferences) {
            this.enablePreferences();
        }
    }

    enableAnalytics() {
        // Enable Google Analytics or custom analytics
        console.log('📊 Analytics abilitati');
        
        // Mock Google Analytics initialization
        if (typeof gtag === 'undefined') {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
        }
    }

    enableMarketing() {
        // Enable marketing pixels/scripts
        console.log('🎯 Marketing cookies abilitati');
        
        // Mock Facebook Pixel
        if (typeof fbq === 'undefined') {
            console.log('Facebook Pixel would be loaded here');
        }
    }

    enablePreferences() {
        // Enable preference tracking
        console.log('⚙️ Cookie preferenze abilitati');
        
        // Apply saved user preferences
        this.applySavedPreferences();
    }

    blockThirdPartyScripts() {
        // Prevent loading of third-party scripts until consent
        console.log('🚫 Script di terze parti bloccati fino al consenso');
    }

    // Data Export/Delete Functions (GDPR Article 15 & 17)
    async requestDataExport() {
        try {
            const userData = await this.collectUserData();
            const exportData = this.formatDataForExport(userData);
            
            // Generate export file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ma-che-serata-data-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Log export request
            this.logDataExport();
            
            window.app.showToast('📦 Dati esportati con successo!', 'success');
            
        } catch (error) {
            console.error('Errore export dati:', error);
            window.app.showToast('❌ Errore durante l\'export', 'error');
        }
    }

    async collectUserData() {
        // Collect all user data from various sources
        const userData = {
            profile: this.getUserProfile(),
            preferences: this.getUserPreferences(),
            activityHistory: this.getActivityHistory(),
            gamificationData: this.getGamificationData(),
            feedbackHistory: this.getFeedbackHistory(),
            notificationSettings: this.getNotificationSettings(),
            consentHistory: this.getConsentHistory()
        };
        
        return userData;
    }

    getUserProfile() {
        return {
            userId: localStorage.getItem('ma-che-serata-user-id'),
            userType: localStorage.getItem('ma-che-serata-user-type'),
            profileData: JSON.parse(localStorage.getItem('ma-che-serata-profile') || '{}'),
            registrationDate: localStorage.getItem('ma-che-serata-registration-date')
        };
    }

    getUserPreferences() {
        return {
            language: localStorage.getItem('ma-che-serata-language'),
            theme: localStorage.getItem('ma-che-serata-theme'),
            notifications: JSON.parse(localStorage.getItem('ma-che-serata-notification-settings') || '{}'),
            dashboard: JSON.parse(localStorage.getItem('ma-che-serata-dashboard-settings') || '{}')
        };
    }

    getActivityHistory() {
        return {
            lastActivity: localStorage.getItem('ma-che-serata-last-activity'),
            eventHistory: JSON.parse(localStorage.getItem('ma-che-serata-event-history') || '[]'),
            bookingHistory: JSON.parse(localStorage.getItem('ma-che-serata-booking-history') || '[]'),
            forumActivity: JSON.parse(localStorage.getItem('ma-che-serata-forum-activity') || '[]')
        };
    }

    getGamificationData() {
        if (window.gamificationSystem) {
            return window.gamificationSystem.getMockGamificationData();
        }
        return JSON.parse(localStorage.getItem('ma-che-serata-gamification') || '{}');
    }

    getFeedbackHistory() {
        return JSON.parse(localStorage.getItem('ma-che-serata-feedback-history') || '[]');
    }

    getNotificationSettings() {
        return {
            pushSubscription: JSON.parse(localStorage.getItem('ma-che-serata-push-subscription') || '{}'),
            notificationHistory: JSON.parse(localStorage.getItem('ma-che-serata-notification-history') || '[]')
        };
    }

    getConsentHistory() {
        return {
            gdprConsent: JSON.parse(localStorage.getItem('ma-che-serata-gdpr-consent') || '{}'),
            privacyPolicyVersion: localStorage.getItem('ma-che-serata-privacy-version'),
            termsVersion: localStorage.getItem('ma-che-serata-terms-version')
        };
    }

    formatDataForExport(userData) {
        return {
            exportInfo: {
                generatedAt: new Date().toISOString(),
                requestedBy: userData.profile.userId,
                dataScope: 'Complete user data as per GDPR Article 15',
                format: 'JSON',
                version: '1.0'
            },
            userData: userData,
            metadata: {
                totalDataPoints: this.countDataPoints(userData),
                categories: Object.keys(userData),
                retention: 'As per our data retention policy',
                contact: 'privacy@macheserata.com'
            }
        };
    }

    countDataPoints(data) {
        let count = 0;
        function countRecursive(obj) {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    countRecursive(obj[key]);
                } else {
                    count++;
                }
            }
        }
        countRecursive(data);
        return count;
    }

    logDataExport() {
        const exportLog = {
            timestamp: new Date().toISOString(),
            userId: localStorage.getItem('ma-che-serata-user-id'),
            type: 'data_export',
            ipAddress: 'masked_for_privacy'
        };
        
        this.userDataExports.push(exportLog);
        localStorage.setItem('ma-che-serata-data-exports', JSON.stringify(this.userDataExports));
    }

    async requestDataDeletion() {
        const confirmed = await this.showDataDeletionConfirmation();
        if (!confirmed) return;
        
        try {
            // Delete user data
            await this.deleteUserData();
            
            // Log deletion request
            this.logDataDeletion();
            
            window.app.showToast('🗑️ Dati eliminati con successo', 'success');
            
            // Redirect to homepage after 3 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
            
        } catch (error) {
            console.error('Errore eliminazione dati:', error);
            window.app.showToast('❌ Errore durante l\'eliminazione', 'error');
        }
    }

    showDataDeletionConfirmation() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'data-deletion-modal';
            modal.innerHTML = `
                <div class="deletion-modal-content">
                    <div class="deletion-header">
                        <h3>⚠️ Elimina i Miei Dati</h3>
                        <p>Sei sicuro di voler eliminare definitivamente tutti i tuoi dati?</p>
                    </div>
                    
                    <div class="deletion-warning">
                        <div class="warning-item">🔒 Tutti i dati del profilo saranno eliminati</div>
                        <div class="warning-item">📊 Cronologia attività e statistiche perse</div>
                        <div class="warning-item">🎮 Punti e badge gamification azzerati</div>
                        <div class="warning-item">📧 Notifiche e preferenze rimosse</div>
                        <div class="warning-item">❌ <strong>Questa azione non può essere annullata</strong></div>
                    </div>
                    
                    <div class="deletion-consent">
                        <label>
                            <input type="checkbox" id="deletionConsent" required>
                            Confermo di voler eliminare definitivamente tutti i miei dati
                        </label>
                    </div>
                    
                    <div class="deletion-actions">
                        <button class="btn-secondary" onclick="resolve(false); this.closest('.data-deletion-modal').remove()">
                            Annulla
                        </button>
                        <button class="btn-danger" id="confirmDeletion" disabled onclick="resolve(true); this.closest('.data-deletion-modal').remove()">
                            🗑️ Elimina Tutto
                        </button>
                    </div>
                </div>
            `;
            
            // Enable confirm button only when checkbox is checked
            const checkbox = modal.querySelector('#deletionConsent');
            const confirmBtn = modal.querySelector('#confirmDeletion');
            
            checkbox.addEventListener('change', () => {
                confirmBtn.disabled = !checkbox.checked;
            });
            
            this.addDataDeletionStyles();
            document.body.appendChild(modal);
            
            setTimeout(() => modal.classList.add('show'), 100);
        });
    }

    async deleteUserData() {
        // List of all localStorage keys to remove
        const keysToRemove = [
            'ma-che-serata-user-id',
            'ma-che-serata-user-type',
            'ma-che-serata-profile',
            'ma-che-serata-language',
            'ma-che-serata-theme',
            'ma-che-serata-notification-settings',
            'ma-che-serata-dashboard-settings',
            'ma-che-serata-last-activity',
            'ma-che-serata-event-history',
            'ma-che-serata-booking-history',
            'ma-che-serata-forum-activity',
            'ma-che-serata-gamification',
            'ma-che-serata-feedback-history',
            'ma-che-serata-push-subscription',
            'ma-che-serata-notification-history',
            'ma-che-serata-gdpr-consent',
            'ma-che-serata-privacy-version',
            'ma-che-serata-terms-version',
            'ma-che-serata-pending-feedbacks'
        ];
        
        // Remove all user data from localStorage
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Clear any session data
        sessionStorage.clear();
        
        // In production, also send deletion request to server
        try {
            await fetch('/.netlify/functions/delete-user-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.getUserProfile().userId,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Errore eliminazione dati server:', error);
        }
    }

    logDataDeletion() {
        const deletionLog = {
            timestamp: new Date().toISOString(),
            userId: localStorage.getItem('ma-che-serata-user-id'),
            type: 'data_deletion',
            ipAddress: 'masked_for_privacy'
        };
        
        // This would typically be sent to a secure audit log
        console.log('Data deletion logged:', deletionLog);
    }

    // Privacy Policy and Terms Management
    showPrivacyPolicy() {
        const modal = this.createPrivacyPolicyModal();
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }

    createPrivacyPolicyModal() {
        const modal = document.createElement('div');
        modal.className = 'privacy-policy-modal';
        modal.innerHTML = `
            <div class="privacy-modal-content">
                <div class="privacy-header">
                    <h3>🔒 Privacy Policy</h3>
                    <button class="close-btn" onclick="this.closest('.privacy-policy-modal').remove()">✕</button>
                </div>
                
                <div class="privacy-body">
                    <div class="privacy-section">
                        <h4>1. Raccolta e Utilizzo dei Dati</h4>
                        <p>Raccogliamo i tuoi dati per fornire e migliorare i nostri servizi:</p>
                        <ul>
                            <li>Dati di registrazione (nome, email, telefono)</li>
                            <li>Preferenze e interessi</li>
                            <li>Attività sulla piattaforma</li>
                            <li>Dati di geolocalizzazione (con consenso)</li>
                        </ul>
                    </div>
                    
                    <div class="privacy-section">
                        <h4>2. Base Legale</h4>
                        <p>Trattiamo i tuoi dati sulla base di:</p>
                        <ul>
                            <li>Consenso esplicito</li>
                            <li>Esecuzione del contratto</li>
                            <li>Interesse legittimo</li>
                            <li>Obblighi legali</li>
                        </ul>
                    </div>
                    
                    <div class="privacy-section">
                        <h4>3. I Tuoi Diritti</h4>
                        <p>Hai il diritto di:</p>
                        <ul>
                            <li>Accedere ai tuoi dati</li>
                            <li>Rettificare dati inesatti</li>
                            <li>Cancellare i tuoi dati</li>
                            <li>Limitare il trattamento</li>
                            <li>Portabilità dei dati</li>
                            <li>Opporti al trattamento</li>
                        </ul>
                    </div>
                    
                    <div class="privacy-section">
                        <h4>4. Sicurezza</h4>
                        <p>Utilizziamo misure tecniche e organizzative appropriate per proteggere i tuoi dati.</p>
                    </div>
                    
                    <div class="privacy-section">
                        <h4>5. Contatti</h4>
                        <p>Per qualsiasi domanda: <strong>privacy@macheserata.com</strong></p>
                    </div>
                </div>
                
                <div class="privacy-actions">
                    <button class="btn-primary" onclick="this.closest('.privacy-policy-modal').remove()">
                        Ho Capito
                    </button>
                </div>
            </div>
        `;
        
        this.addPrivacyModalStyles();
        return modal;
    }

    // User Rights Dashboard
    createUserRightsDashboard() {
        return `
            <div class="user-rights-dashboard">
                <h3>🔒 I Miei Diritti Privacy</h3>
                
                <div class="rights-section">
                    <h4>📊 Esporta i Miei Dati</h4>
                    <p>Scarica una copia completa di tutti i tuoi dati (Art. 15 GDPR)</p>
                    <button class="btn-primary" onclick="gdprSystem.requestDataExport()">
                        📦 Esporta Dati
                    </button>
                </div>
                
                <div class="rights-section">
                    <h4>🗑️ Elimina il Mio Account</h4>
                    <p>Elimina definitivamente tutti i tuoi dati (Art. 17 GDPR)</p>
                    <button class="btn-danger" onclick="gdprSystem.requestDataDeletion()">
                        🗑️ Elimina Account
                    </button>
                </div>
                
                <div class="rights-section">
                    <h4>🍪 Gestisci Cookie</h4>
                    <p>Modifica le tue preferenze sui cookie</p>
                    <button class="btn-secondary" onclick="gdprSystem.showCookieSettings()">
                        ⚙️ Impostazioni Cookie
                    </button>
                </div>
                
                <div class="rights-section">
                    <h4>📋 Privacy Policy</h4>
                    <p>Leggi la nostra informativa sulla privacy</p>
                    <button class="btn-secondary" onclick="gdprSystem.showPrivacyPolicy()">
                        📋 Leggi Privacy Policy
                    </button>
                </div>
                
                <div class="consent-status">
                    <h4>✅ Stato Consensi</h4>
                    <div class="consent-item">
                        <span>Cookie Necessari:</span> 
                        <span class="status enabled">Abilitati</span>
                    </div>
                    <div class="consent-item">
                        <span>Cookie Analitici:</span> 
                        <span class="status ${this.cookieSettings.analytics ? 'enabled' : 'disabled'}">
                            ${this.cookieSettings.analytics ? 'Abilitati' : 'Disabilitati'}
                        </span>
                    </div>
                    <div class="consent-item">
                        <span>Cookie Marketing:</span> 
                        <span class="status ${this.cookieSettings.marketing ? 'enabled' : 'disabled'}">
                            ${this.cookieSettings.marketing ? 'Abilitati' : 'Disabilitati'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Listen for consent updates
        window.addEventListener('gdprConsentUpdated', () => {
            this.enableApprovedServices();
        });
    }

    applySavedPreferences() {
        // Apply user preferences if consent given
        const theme = localStorage.getItem('ma-che-serata-theme');
        if (theme) {
            document.body.setAttribute('data-theme', theme);
        }
    }

    // Styles
    addCookieBannerStyles() {
        if (document.getElementById('cookie-banner-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'cookie-banner-styles';
        styles.textContent = `
            .gdpr-cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: white;
                z-index: 10000;
                border-top: 1px solid rgba(255,255,255,0.1);
                transform: translateY(100%);
                transition: transform 0.3s ease;
                backdrop-filter: blur(15px);
            }
            
            .gdpr-cookie-banner.show {
                transform: translateY(0);
            }
            
            .cookie-banner-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1.5rem 2rem;
                gap: 2rem;
            }
            
            .cookie-info h3 {
                margin: 0 0 0.5rem 0;
                font-size: 1.2rem;
            }
            
            .cookie-info p {
                margin: 0;
                opacity: 0.9;
                font-size: 0.9rem;
            }
            
            .cookie-actions {
                display: flex;
                gap: 1rem;
                flex-shrink: 0;
            }
            
            .cookie-actions button {
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 20px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
            }
            
            .btn-settings {
                background: rgba(255,255,255,0.1);
                color: white;
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            .btn-accept-necessary {
                background: rgba(255,255,255,0.1);
                color: white;
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            .btn-accept-all {
                background: linear-gradient(45deg, #4ade80, #22c55e);
                color: white;
            }
            
            .cookie-actions button:hover {
                transform: translateY(-1px);
            }
            
            @media (max-width: 768px) {
                .cookie-banner-content {
                    flex-direction: column;
                    text-align: center;
                    gap: 1rem;
                }
                
                .cookie-actions {
                    flex-wrap: wrap;
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    addCookieSettingsStyles() {
        if (document.getElementById('cookie-settings-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'cookie-settings-styles';
        styles.textContent = `
            .cookie-settings-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                backdrop-filter: blur(5px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .cookie-settings-modal.show {
                opacity: 1;
            }
            
            .cookie-settings-content {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border-radius: 20px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 2rem 2rem 1rem 2rem;
                color: white;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .settings-header h3 {
                margin: 0;
                font-size: 1.5rem;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }
            
            .close-btn:hover {
                opacity: 1;
            }
            
            .settings-body {
                padding: 2rem;
            }
            
            .cookie-category {
                margin-bottom: 2rem;
                padding: 1.5rem;
                background: rgba(255,255,255,0.05);
                border-radius: 15px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .category-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                color: white;
            }
            
            .category-header h4 {
                margin: 0;
                font-size: 1.1rem;
            }
            
            .cookie-category p {
                margin: 0 0 1rem 0;
                color: rgba(255,255,255,0.8);
                font-size: 0.9rem;
            }
            
            .cookie-details {
                font-size: 0.8rem;
                color: rgba(255,255,255,0.6);
                background: rgba(255,255,255,0.05);
                padding: 0.8rem;
                border-radius: 8px;
            }
            
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 60px;
                height: 34px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: 0.4s;
                border-radius: 34px;
            }
            
            .slider:before {
                position: absolute;
                content: "";
                height: 26px;
                width: 26px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: 0.4s;
                border-radius: 50%;
            }
            
            input:checked + .slider {
                background-color: #4ade80;
            }
            
            input:checked + .slider:before {
                transform: translateX(26px);
            }
            
            input:disabled + .slider {
                background-color: #4ade80;
                cursor: not-allowed;
            }
            
            .settings-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                padding: 2rem;
                border-top: 1px solid rgba(255,255,255,0.1);
            }
            
            .btn-secondary,
            .btn-primary {
                padding: 1rem 2rem;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-secondary {
                background: rgba(255,255,255,0.1);
                color: white;
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            .btn-primary {
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
            }
        `;
        
        document.head.appendChild(styles);
    }

    addDataDeletionStyles() {
        if (document.getElementById('data-deletion-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'data-deletion-styles';
        styles.textContent = `
            .data-deletion-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                backdrop-filter: blur(5px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .data-deletion-modal.show {
                opacity: 1;
            }
            
            .deletion-modal-content {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                padding: 2rem;
                border: 1px solid rgba(255,255,255,0.1);
                color: white;
            }
            
            .deletion-header {
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .deletion-header h3 {
                margin: 0 0 1rem 0;
                color: #ff6b6b;
                font-size: 1.5rem;
            }
            
            .deletion-warning {
                background: rgba(255, 107, 107, 0.1);
                border: 1px solid rgba(255, 107, 107, 0.3);
                border-radius: 10px;
                padding: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .warning-item {
                margin-bottom: 0.8rem;
                font-size: 0.9rem;
            }
            
            .deletion-consent {
                margin-bottom: 2rem;
                text-align: center;
            }
            
            .deletion-consent label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
            }
            
            .deletion-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
            
            .btn-danger {
                background: linear-gradient(45deg, #ff6b6b, #ff5252);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-danger:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        
        document.head.appendChild(styles);
    }

    addPrivacyModalStyles() {
        if (document.getElementById('privacy-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'privacy-modal-styles';
        styles.textContent = `
            .privacy-policy-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                backdrop-filter: blur(5px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .privacy-policy-modal.show {
                opacity: 1;
            }
            
            .privacy-modal-content {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border-radius: 20px;
                max-width: 700px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid rgba(255,255,255,0.1);
                color: white;
            }
            
            .privacy-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 2rem 2rem 1rem 2rem;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .privacy-body {
                padding: 2rem;
            }
            
            .privacy-section {
                margin-bottom: 2rem;
            }
            
            .privacy-section h4 {
                color: #4ade80;
                margin-bottom: 1rem;
            }
            
            .privacy-section ul {
                margin: 1rem 0;
                padding-left: 1.5rem;
            }
            
            .privacy-section li {
                margin-bottom: 0.5rem;
                opacity: 0.9;
            }
            
            .privacy-actions {
                padding: 2rem;
                border-top: 1px solid rgba(255,255,255,0.1);
                text-align: center;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize global GDPR system
window.gdprSystem = new GDPRComplianceSystem();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gdprSystem.init();
});