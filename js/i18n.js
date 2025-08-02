/**
 * INTERNATIONALIZATION SYSTEM (i18n)
 * Sistema multilingua per Ma Che Serata
 */

class I18nSystem {
    constructor() {
        this.currentLanguage = 'it';
        this.supportedLanguages = ['it', 'en'];
        this.translations = {};
        this.fallbackLanguage = 'it';
        this.isLoading = false;
    }

    async init() {
        // Detect language from various sources
        this.currentLanguage = this.detectLanguage();
        
        // Load translations for current language
        await this.loadTranslations(this.currentLanguage);
        
        // Apply translations to the page
        this.applyTranslations();
        
        // Setup language selector
        this.setupLanguageSelector();
        
        console.log(`🌍 i18n inizializzato - Lingua: ${this.currentLanguage}`);
    }

    detectLanguage() {
        // Priority: localStorage > URL param > browser language > fallback
        
        // 1. Check localStorage
        const savedLang = localStorage.getItem('ma-che-serata-language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            return savedLang;
        }
        
        // 2. Check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.supportedLanguages.includes(urlLang)) {
            return urlLang;
        }
        
        // 3. Check browser language
        const browserLang = navigator.language.toLowerCase().split('-')[0];
        if (this.supportedLanguages.includes(browserLang)) {
            return browserLang;
        }
        
        // 4. Fallback
        return this.fallbackLanguage;
    }

    async loadTranslations(language) {
        if (this.isLoading || this.translations[language]) {
            return;
        }

        this.isLoading = true;

        try {
            // In production, these would be loaded from separate JSON files
            const translations = await this.getTranslations(language);
            this.translations[language] = translations;
        } catch (error) {
            console.error(`Errore caricamento traduzioni per ${language}:`, error);
            // Fallback to default language if available
            if (language !== this.fallbackLanguage && !this.translations[this.fallbackLanguage]) {
                await this.loadTranslations(this.fallbackLanguage);
            }
        } finally {
            this.isLoading = false;
        }
    }

    async getTranslations(language) {
        // Mock translation data - in production, load from JSON files or API
        const translations = {
            it: {
                // Navigation
                'nav.home': 'Home',
                'nav.events': 'Eventi',
                'nav.flir2night': 'Flir2night',
                'nav.about': 'Chi Siamo',
                'nav.login': 'Accedi',
                'nav.dashboard': 'Dashboard',
                'nav.logout': 'Esci',

                // Homepage
                'home.title': 'Ma Che Serata',
                'home.subtitle': 'Scopri la nightlife che fa per te',
                'home.cta': 'Scopri gli Eventi',
                'home.register': 'Registrati Gratis',

                // Events
                'events.title': 'I Nostri Eventi',
                'events.filter': 'Filtra Eventi',
                'events.category': 'Categoria',
                'events.date': 'Data',
                'events.location': 'Luogo',
                'events.book_solo': 'Prenota Solo',
                'events.book_together': 'Prenota Insieme',
                'events.sold_out': 'Sold Out',
                'events.available': 'Disponibile',

                // Registration
                'register.title': 'Registrati',
                'register.email': 'Email',
                'register.password': 'Password',
                'register.confirm_password': 'Conferma Password',
                'register.name': 'Nome',
                'register.surname': 'Cognome',
                'register.phone': 'Telefono',
                'register.user_type': 'Tipo Account',
                'register.user_type.matcher': '🎭 Matcher - Voglio partecipare agli eventi (Accesso immediato)',
                'register.user_type.pr': '📢 PR/Promoter - Promuovo eventi e locali (Validazione richiesta)',
                'register.user_type.manager': '🍸 Gestore Locale - Gestisco un locale/venue (Validazione richiesta)',
                'register.user_type.artist': '🎵 Artista - Sono un DJ/performer (Validazione richiesta)',
                'register.accept_terms': 'Accetto i Termini di Servizio e la Privacy Policy',
                'register.submit': 'Registrati',

                // Login
                'login.title': 'Accedi',
                'login.email': 'Email',
                'login.password': 'Password',
                'login.submit': 'Accedi',
                'login.forgot_password': 'Password dimenticata?',
                'login.no_account': 'Non hai un account?',
                'login.register_here': 'Registrati qui',

                // Dashboard
                'dashboard.welcome': 'Benvenuto',
                'dashboard.matcher.title': 'Dashboard Matcher',
                'dashboard.pr.title': 'Dashboard PR (StagePass)',
                'dashboard.manager.title': 'Dashboard Manager (Spotlight)',
                'dashboard.artist.title': 'Dashboard Artist (Performer)',

                // Profile
                'profile.title': 'Il Mio Profilo',
                'profile.photo': 'Foto Profilo',
                'profile.description': 'Descrizione',
                'profile.description.placeholder': 'Racconta alla community che tipo di matcher sei!',
                'profile.interests': 'I Miei Interessi',
                'profile.save': 'Salva Profilo',

                // Gamification
                'gamification.cheers_points': 'Cheers Points',
                'gamification.level': 'Livello',
                'gamification.badges': 'Badge',
                'gamification.vibes_index': 'Vibes Index',
                'gamification.leaderboard': 'Classifica',

                // Common
                'common.save': 'Salva',
                'common.cancel': 'Annulla',
                'common.edit': 'Modifica',
                'common.delete': 'Elimina',
                'common.confirm': 'Conferma',
                'common.loading': 'Caricamento...',
                'common.error': 'Errore',
                'common.success': 'Successo',
                'common.close': 'Chiudi',

                // Messages
                'messages.login_success': 'Login effettuato con successo!',
                'messages.registration_success': 'Registrazione completata!',
                'messages.profile_updated': 'Profilo aggiornato con successo!',
                'messages.error_generic': 'Si è verificato un errore. Riprova.',

                // Categories
                'category.aperitivi': 'Aperitivi',
                'category.cene': 'Cene',
                'category.discoteca': 'Discoteca',
                'category.eventi_speciali': 'Eventi Speciali',
                'category.concerti': 'Concerti',
                'category.party_privati': 'Party Privati'
            },

            en: {
                // Navigation
                'nav.home': 'Home',
                'nav.events': 'Events',
                'nav.flir2night': 'Flir2night',
                'nav.about': 'About Us',
                'nav.login': 'Login',
                'nav.dashboard': 'Dashboard',
                'nav.logout': 'Logout',

                // Homepage
                'home.title': 'Ma Che Serata',
                'home.subtitle': 'Discover the nightlife that suits you',
                'home.cta': 'Discover Events',
                'home.register': 'Sign Up Free',

                // Events
                'events.title': 'Our Events',
                'events.filter': 'Filter Events',
                'events.category': 'Category',
                'events.date': 'Date',
                'events.location': 'Location',
                'events.book_solo': 'Book Solo',
                'events.book_together': 'Book Together',
                'events.sold_out': 'Sold Out',
                'events.available': 'Available',

                // Registration
                'register.title': 'Sign Up',
                'register.email': 'Email',
                'register.password': 'Password',
                'register.confirm_password': 'Confirm Password',
                'register.name': 'First Name',
                'register.surname': 'Last Name',
                'register.phone': 'Phone',
                'register.user_type': 'Account Type',
                'register.user_type.matcher': '🎭 Matcher - I want to join events (Immediate access)',
                'register.user_type.pr': '📢 PR/Promoter - I promote events and venues (Validation required)',
                'register.user_type.manager': '🍸 Venue Manager - I manage a venue/club (Validation required)',
                'register.user_type.artist': '🎵 Artist - I\'m a DJ/performer (Validation required)',
                'register.accept_terms': 'I accept the Terms of Service and Privacy Policy',
                'register.submit': 'Sign Up',

                // Login
                'login.title': 'Login',
                'login.email': 'Email',
                'login.password': 'Password',
                'login.submit': 'Login',
                'login.forgot_password': 'Forgot password?',
                'login.no_account': 'Don\'t have an account?',
                'login.register_here': 'Sign up here',

                // Dashboard
                'dashboard.welcome': 'Welcome',
                'dashboard.matcher.title': 'Matcher Dashboard',
                'dashboard.pr.title': 'PR Dashboard (StagePass)',
                'dashboard.manager.title': 'Manager Dashboard (Spotlight)',
                'dashboard.artist.title': 'Artist Dashboard (Performer)',

                // Profile
                'profile.title': 'My Profile',
                'profile.photo': 'Profile Photo',
                'profile.description': 'Description',
                'profile.description.placeholder': 'Tell the community what kind of matcher you are!',
                'profile.interests': 'My Interests',
                'profile.save': 'Save Profile',

                // Gamification
                'gamification.cheers_points': 'Cheers Points',
                'gamification.level': 'Level',
                'gamification.badges': 'Badges',
                'gamification.vibes_index': 'Vibes Index',
                'gamification.leaderboard': 'Leaderboard',

                // Common
                'common.save': 'Save',
                'common.cancel': 'Cancel',
                'common.edit': 'Edit',
                'common.delete': 'Delete',
                'common.confirm': 'Confirm',
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success',
                'common.close': 'Close',

                // Messages
                'messages.login_success': 'Login successful!',
                'messages.registration_success': 'Registration completed!',
                'messages.profile_updated': 'Profile updated successfully!',
                'messages.error_generic': 'An error occurred. Please try again.',

                // Categories
                'category.aperitivi': 'Aperitifs',
                'category.cene': 'Dinners',
                'category.discoteca': 'Nightclub',
                'category.eventi_speciali': 'Special Events',
                'category.concerti': 'Concerts',
                'category.party_privati': 'Private Parties'
            }
        };

        return translations[language] || translations[this.fallbackLanguage];
    }

    t(key, params = {}) {
        // Get translation for key
        const translation = this.getTranslation(key);
        
        // Replace parameters in translation
        return this.interpolate(translation, params);
    }

    getTranslation(key) {
        const currentTranslations = this.translations[this.currentLanguage];
        const fallbackTranslations = this.translations[this.fallbackLanguage];
        
        // Try current language first
        if (currentTranslations && currentTranslations[key]) {
            return currentTranslations[key];
        }
        
        // Fall back to default language
        if (fallbackTranslations && fallbackTranslations[key]) {
            return fallbackTranslations[key];
        }
        
        // Return key if no translation found
        console.warn(`Traduzione mancante per chiave: ${key}`);
        return key;
    }

    interpolate(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] || match;
        });
    }

    async changeLanguage(language) {
        if (!this.supportedLanguages.includes(language)) {
            console.error(`Lingua non supportata: ${language}`);
            return;
        }

        if (language === this.currentLanguage) {
            return;
        }

        this.currentLanguage = language;
        
        // Save to localStorage
        localStorage.setItem('ma-che-serata-language', language);
        
        // Load translations if not already loaded
        await this.loadTranslations(language);
        
        // Apply translations
        this.applyTranslations();
        
        // Update URL parameter
        this.updateURLLanguage(language);
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language, translations: this.translations[language] }
        }));

        if (window.app) {
            window.app.showToast(`🌍 Lingua cambiata in ${this.getLanguageName(language)}`, 'success');
        }
    }

    applyTranslations() {
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // Apply translation based on element type
            if (element.tagName === 'INPUT' && (element.type === 'submit' || element.type === 'button')) {
                element.value = translation;
            } else if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else if (element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update page title
        const titleElement = document.querySelector('title');
        if (titleElement && titleElement.hasAttribute('data-i18n')) {
            document.title = this.t(titleElement.getAttribute('data-i18n'));
        }
    }

    setupLanguageSelector() {
        // Create language selector if it doesn't exist
        let langSelector = document.getElementById('language-selector');
        
        if (!langSelector) {
            langSelector = this.createLanguageSelector();
        }
        
        // Update selector
        this.updateLanguageSelector(langSelector);
    }

    createLanguageSelector() {
        const selector = document.createElement('div');
        selector.id = 'language-selector';
        selector.className = 'language-selector';
        selector.innerHTML = `
            <button class="lang-btn" data-lang="it">
                <span class="flag">🇮🇹</span> IT
            </button>
            <button class="lang-btn" data-lang="en">
                <span class="flag">🇬🇧</span> EN
            </button>
        `;

        // Add CSS if not already present
        if (!document.getElementById('i18n-styles')) {
            const styles = document.createElement('style');
            styles.id = 'i18n-styles';
            styles.textContent = `
                .language-selector {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                    display: flex;
                    gap: 5px;
                }

                .lang-btn {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 8px;
                    color: white;
                    padding: 8px 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                }

                .lang-btn:hover {
                    background: rgba(255,255,255,0.2);
                    border-color: rgba(255,255,255,0.4);
                }

                .lang-btn.active {
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                    border-color: transparent;
                    font-weight: bold;
                }

                .lang-btn .flag {
                    margin-right: 4px;
                }

                @media (max-width: 768px) {
                    .language-selector {
                        top: 10px;
                        right: 10px;
                    }
                    
                    .lang-btn {
                        padding: 6px 8px;
                        font-size: 0.8rem;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        // Add event listeners
        selector.addEventListener('click', (e) => {
            const langBtn = e.target.closest('.lang-btn');
            if (langBtn) {
                const language = langBtn.getAttribute('data-lang');
                this.changeLanguage(language);
            }
        });

        // Append to body
        document.body.appendChild(selector);
        
        return selector;
    }

    updateLanguageSelector(selector) {
        const buttons = selector.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === this.currentLanguage);
        });
    }

    updateURLLanguage(language) {
        const url = new URL(window.location);
        url.searchParams.set('lang', language);
        window.history.replaceState({}, '', url);
    }

    getLanguageName(code) {
        const names = {
            'it': 'Italiano',
            'en': 'English'
        };
        return names[code] || code;
    }

    // Utility methods for dynamic content
    translateElement(element, key, params = {}) {
        if (!element) return;
        
        element.setAttribute('data-i18n', key);
        const translation = this.t(key, params);
        
        if (element.tagName === 'INPUT' && (element.type === 'submit' || element.type === 'button')) {
            element.value = translation;
        } else if (element.tagName === 'INPUT' && element.type === 'text') {
            element.placeholder = translation;
        } else if (element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    }

    // Method to add translations dynamically (for plugins/extensions)
    addTranslations(language, translations) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        
        Object.assign(this.translations[language], translations);
        
        // Re-apply translations if current language
        if (language === this.currentLanguage) {
            this.applyTranslations();
        }
    }

    // Get current language info
    getCurrentLanguage() {
        return {
            code: this.currentLanguage,
            name: this.getLanguageName(this.currentLanguage),
            isRTL: false // Add RTL support for Arabic, Hebrew, etc.
        };
    }
}

// Initialize global i18n instance
window.i18n = new I18nSystem();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.init();
});

// Event listener for language changes (for other components to react)
window.addEventListener('languageChanged', (event) => {
    console.log(`🌍 Lingua cambiata: ${event.detail.language}`);
    
    // Trigger re-rendering of dynamic content
    if (window.gamificationSystem) {
        window.gamificationSystem.updateAllDisplays();
    }
    
    if (window.dashboardRouter) {
        window.dashboardRouter.updateNavigationLinks();
    }
});