class GamificationSystem {
    constructor() {
        this.userPoints = 0;
        this.userBadges = [];
        this.userLevel = 1;
        this.vibesIndex = 0;
        this.leaderboardPosition = null;
        this.achievements = [];
        this.init();
    }

    init() {
        console.log('Gamification System inizializzato');
        this.loadUserGamificationData();
        this.setupPointsDisplay();
        this.initializeEventListeners();
    }

    async loadUserGamificationData() {
        try {
            // Simuliamo il caricamento dei dati di gamification
            const mockData = this.getMockGamificationData();
            
            this.userPoints = mockData.points;
            this.userBadges = mockData.badges;
            this.userLevel = mockData.level;
            this.vibesIndex = mockData.vibesIndex;
            this.leaderboardPosition = mockData.leaderboardPosition;
            this.achievements = mockData.achievements;
            
            this.updateAllDisplays();
            
        } catch (error) {
            console.error('Errore nel caricamento dati gamification:', error);
        }
    }

    getMockGamificationData() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userType = currentUser.user_type || 'matcher';
        
        // Dati mock diversi per tipo di utente
        const mockDataByType = {
            'matcher': {
                points: 1247,
                level: 3,
                badges: ['early_bird', 'social_butterfly', 'trend_setter'],
                vibesIndex: 78,
                leaderboardPosition: 23,
                achievements: [
                    { id: 'first_booking', name: 'Prima Prenotazione', description: 'Hai fatto la tua prima prenotazione!', date: '2024-01-10', icon: '🎫' },
                    { id: 'social_king', name: 'Social King', description: 'Hai invitato 5 amici', date: '2024-01-15', icon: '👑' },
                    { id: 'review_master', name: 'Review Master', description: 'Hai lasciato 10 recensioni', date: '2024-01-20', icon: '⭐' }
                ]
            },
            'pr': {
                points: 2450,
                level: 5,
                badges: ['top_host', 'influencer', 'party_maker'],
                vibesIndex: 89,
                leaderboardPosition: 8,
                achievements: [
                    { id: 'event_creator', name: 'Event Creator', description: 'Hai creato il tuo primo evento', date: '2024-01-05', icon: '🎉' },
                    { id: 'crowd_pleaser', name: 'Crowd Pleaser', description: '100+ partecipanti ai tuoi eventi', date: '2024-01-12', icon: '🔥' },
                    { id: 'viral_moment', name: 'Viral Moment', description: 'Un tuo evento ha raggiunto 1000 visualizzazioni', date: '2024-01-18', icon: '📈' }
                ]
            },
            'manager': {
                points: 3120,
                level: 6,
                badges: ['venue_master', 'hospitality_pro', 'customer_favorite'],
                vibesIndex: 92,
                leaderboardPosition: 5,
                achievements: [
                    { id: 'venue_launch', name: 'Venue Launch', description: 'Hai aperto il tuo locale sulla piattaforma', date: '2024-01-02', icon: '🏢' },
                    { id: 'full_house', name: 'Full House', description: 'Hai raggiunto il sold-out', date: '2024-01-10', icon: '🎪' },
                    { id: 'five_stars', name: 'Five Stars', description: 'Hai mantenuto 5 stelle per un mese', date: '2024-01-25', icon: '🌟' }
                ]
            },
            'artist': {
                points: 1890,
                level: 4,
                badges: ['performer', 'fan_favorite', 'rising_star'],
                vibesIndex: 84,
                leaderboardPosition: 15,
                achievements: [
                    { id: 'first_gig', name: 'First Gig', description: 'Hai suonato il tuo primo set', date: '2024-01-08', icon: '🎵' },
                    { id: 'crowd_control', name: 'Crowd Control', description: 'Hai fatto ballare 200+ persone', date: '2024-01-16', icon: '💃' },
                    { id: 'playlist_master', name: 'Playlist Master', description: 'Hai creato 10 playlist', date: '2024-01-22', icon: '📀' }
                ]
            }
        };
        
        return mockDataByType[userType] || mockDataByType['matcher'];
    }

    // Sistema di Punti Cheers
    addCheersPoints(amount, reason) {
        this.userPoints += amount;
        this.checkLevelUp();
        this.saveGamificationData();
        
        // Mostra notifica
        window.app.showToast(`+${amount} Cheers Points! ${reason}`, 'success');
        
        // Aggiorna display
        this.updatePointsDisplay();
        
        // Trigger evento per analytics
        this.triggerPointsEvent(amount, reason);
    }

    spendCheersPoints(amount, item) {
        if (this.userPoints >= amount) {
            this.userPoints -= amount;
            this.saveGamificationData();
            this.updatePointsDisplay();
            
            window.app.showToast(`Hai speso ${amount} Cheers Points per ${item}!`, 'info');
            return true;
        } else {
            window.app.showToast('Cheers Points insufficienti!', 'warning');
            return false;
        }
    }

    checkLevelUp() {
        const newLevel = this.calculateLevel(this.userPoints);
        if (newLevel > this.userLevel) {
            this.userLevel = newLevel;
            this.handleLevelUp(newLevel);
        }
    }

    calculateLevel(points) {
        // Formula per calcolare il livello basata sui punti
        return Math.floor(Math.sqrt(points / 100)) + 1;
    }

    handleLevelUp(newLevel) {
        // Effetti visivi per level up
        this.showLevelUpAnimation(newLevel);
        
        // Reward per level up
        const rewardPoints = newLevel * 50;
        this.userPoints += rewardPoints;
        
        // Sblocca nuovo badge se applicabile
        this.checkLevelBadges(newLevel);
        
        window.app.showToast(`🎉 LEVEL UP! Sei ora livello ${newLevel}! Bonus: +${rewardPoints} Cheers Points`, 'success');
    }

    showLevelUpAnimation(level) {
        // Crea animazione di level up
        const animation = document.createElement('div');
        animation.className = 'level-up-animation';
        animation.innerHTML = `
            <div class="level-up-content">
                <h2>🎉 LEVEL UP! 🎉</h2>
                <p>Livello ${level}</p>
            </div>
        `;
        
        animation.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeInOut 3s ease-in-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
            .level-up-content {
                text-align: center;
                color: white;
                font-size: 24px;
                animation: bounce 1s ease-in-out;
            }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-30px); }
                60% { transform: translateY(-15px); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(animation);
        
        setTimeout(() => {
            document.body.removeChild(animation);
            document.head.removeChild(style);
        }, 3000);
    }

    // Sistema Badge
    unlockBadge(badgeId, reason) {
        if (!this.userBadges.includes(badgeId)) {
            this.userBadges.push(badgeId);
            this.saveGamificationData();
            
            const badge = this.getBadgeInfo(badgeId);
            this.showBadgeUnlockedAnimation(badge);
            
            window.app.showToast(`🏆 Badge sbloccato: ${badge.name}!`, 'success');
            
            // Bonus points per nuovo badge
            this.addCheersPoints(100, 'Nuovo Badge sbloccato');
        }
    }

    getBadgeInfo(badgeId) {
        const badges = {
            'early_bird': { name: 'Early Bird', description: 'Prenota eventi in anticipo', icon: '🐦', color: '#feca57' },
            'social_butterfly': { name: 'Social Butterfly', description: 'Invita molti amici', icon: '🦋', color: '#ff6b6b' },
            'trend_setter': { name: 'Trend Setter', description: 'Scopri eventi prima degli altri', icon: '🌟', color: '#48dbfb' },
            'top_host': { name: 'Top Host', description: 'Organizza eventi di successo', icon: '👑', color: '#ff9ff3' },
            'influencer': { name: 'Influencer', description: 'Alto engagement sui social', icon: '📱', color: '#54a0ff' },
            'party_maker': { name: 'Party Maker', description: 'Crea atmosfere indimenticabili', icon: '🎉', color: '#5f27cd' },
            'venue_master': { name: 'Venue Master', description: 'Gestisci il locale alla perfezione', icon: '🏢', color: '#00d2d3' },
            'hospitality_pro': { name: 'Hospitality Pro', description: 'Servizio clienti eccellente', icon: '🤝', color: '#ff6348' },
            'customer_favorite': { name: 'Customer Favorite', description: 'Amato dai clienti', icon: '❤️', color: '#e74c3c' },
            'performer': { name: 'Performer', description: 'Talento artistico riconosciuto', icon: '🎵', color: '#9c88ff' },
            'fan_favorite': { name: 'Fan Favorite', description: 'Adorato dal pubblico', icon: '🌟', color: '#feca57' },
            'rising_star': { name: 'Rising Star', description: 'Artista emergente', icon: '⭐', color: '#ff9ff3' }
        };
        
        return badges[badgeId] || { name: badgeId, description: 'Badge speciale', icon: '🏆', color: '#ddd' };
    }

    showBadgeUnlockedAnimation(badge) {
        const animation = document.createElement('div');
        animation.className = 'badge-unlock-animation';
        animation.innerHTML = `
            <div class="badge-unlock-content">
                <div class="badge-icon" style="background: ${badge.color};">${badge.icon}</div>
                <h3>Badge Sbloccato!</h3>
                <h2>${badge.name}</h2>
                <p>${badge.description}</p>
            </div>
        `;
        
        animation.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: slideInFromTop 2s ease-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInFromTop {
                0% { transform: translateY(-100%); opacity: 0; }
                50% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(0); opacity: 1; }
            }
            .badge-unlock-content {
                text-align: center;
                color: white;
                background: rgba(255,255,255,0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(20px);
            }
            .badge-icon {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                margin: 0 auto 20px;
                animation: pulse 1s infinite;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(animation);
        
        setTimeout(() => {
            document.body.removeChild(animation);
            document.head.removeChild(style);
        }, 4000);
    }

    checkLevelBadges(level) {
        const levelBadges = {
            5: 'trend_setter',
            10: 'influencer',
            15: 'top_host',
            20: 'venue_master'
        };
        
        if (levelBadges[level]) {
            this.unlockBadge(levelBadges[level], `Raggiunto livello ${level}`);
        }
    }

    // Sistema Vibes Index
    updateVibesIndex(eventId, factor) {
        // Formula per calcolare il Vibes Index
        const currentVibes = this.vibesIndex;
        const newVibes = Math.min(100, Math.max(0, currentVibes + factor));
        
        this.vibesIndex = newVibes;
        this.saveGamificationData();
        
        // Aggiorna display se presente
        this.updateVibesDisplay();
        
        return newVibes;
    }

    calculateEventVibes(eventData) {
        // Calcola il Vibes Index per un evento basato su vari fattori
        let vibesScore = 50; // Base score
        
        // Fattori che influenzano i Vibes
        const factors = {
            bookings: (eventData.bookings / eventData.capacity) * 30, // 30% max dal booking ratio
            social_mentions: (eventData.socialMentions || 0) * 0.5, // Social media buzz
            reviews: (eventData.averageRating || 3) * 10, // Rating medio
            flir2night_posts: (eventData.flir2nightPosts || 0) * 2, // Post sulla community
            artist_popularity: (eventData.artistPopularity || 50) * 0.2 // Popolarità artista
        };
        
        // Somma tutti i fattori
        Object.values(factors).forEach(factor => {
            vibesScore += factor;
        });
        
        // Limita tra 0 e 100
        return Math.min(100, Math.max(0, Math.round(vibesScore)));
    }

    // Leaderboard System
    async updateLeaderboard() {
        try {
            // Simula aggiornamento leaderboard
            const mockLeaderboard = this.generateMockLeaderboard();
            
            // Trova posizione utente corrente
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userEntry = mockLeaderboard.find(entry => entry.username === currentUser.username);
            
            if (userEntry) {
                this.leaderboardPosition = userEntry.position;
            }
            
            return mockLeaderboard;
            
        } catch (error) {
            console.error('Errore aggiornamento leaderboard:', error);
            return [];
        }
    }

    generateMockLeaderboard() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userType = currentUser.user_type || 'matcher';
        
        // Genera leaderboard diversa per tipo utente
        const leaderboards = {
            'matcher': [
                { position: 1, username: 'PartyKing94', points: 5420, level: 8, badge: '👑' },
                { position: 2, username: 'DanceQueen', points: 4890, level: 7, badge: '💃' },
                { position: 3, username: 'NightOwl', points: 4234, level: 7, badge: '🦉' },
                { position: 4, username: 'VibeMaster', points: 3876, level: 6, badge: '🎵' },
                { position: 5, username: 'SocialBee', points: 3654, level: 6, badge: '🐝' }
            ],
            'pr': [
                { position: 1, username: 'EventMaestro', points: 8920, level: 12, badge: '🎭' },
                { position: 2, username: 'PromoGuru', points: 7234, level: 10, badge: '📢' },
                { position: 3, username: 'PartyPlanner', points: 6543, level: 9, badge: '🎉' },
                { position: 4, username: 'HypeBuilder', points: 5876, level: 8, badge: '🔥' },
                { position: 5, username: 'CrowdController', points: 5234, level: 8, badge: '👥' }
            ],
            'manager': [
                { position: 1, username: 'VenueKing', points: 12340, level: 15, badge: '🏰' },
                { position: 2, username: 'HospitalityPro', points: 9876, level: 12, badge: '🤝' },
                { position: 3, username: 'SpotlightMaster', points: 8765, level: 11, badge: '💡' },
                { position: 4, username: 'CustomerFirst', points: 7654, level: 10, badge: '❤️' },
                { position: 5, username: 'ClubLegend', points: 6543, level: 9, badge: '🏆' }
            ],
            'artist': [
                { position: 1, username: 'BeatMaster', points: 9876, level: 13, badge: '🎧' },
                { position: 2, username: 'SoundWizard', points: 8234, level: 11, badge: '🎼' },
                { position: 3, username: 'MixMaster', points: 7123, level: 10, badge: '🎚️' },
                { position: 4, username: 'RhythmKing', points: 6234, level: 9, badge: '👑' },
                { position: 5, username: 'BassBeast', points: 5432, level: 8, badge: '🔊' }
            ]
        };
        
        let leaderboard = leaderboards[userType] || leaderboards['matcher'];
        
        // Aggiungi utente corrente se non presente
        if (currentUser.username && !leaderboard.find(entry => entry.username === currentUser.username)) {
            leaderboard.push({
                position: this.leaderboardPosition || Math.floor(Math.random() * 50) + 10,
                username: currentUser.username,
                points: this.userPoints,
                level: this.userLevel,
                badge: this.userBadges[0] ? this.getBadgeInfo(this.userBadges[0]).icon : '🎭'
            });
            
            // Riordina per posizione
            leaderboard.sort((a, b) => a.position - b.position);
        }
        
        return leaderboard;
    }

    // Display e UI Updates
    setupPointsDisplay() {
        // Crea widget punti se non esiste
        this.createPointsWidget();
        this.updatePointsDisplay();
    }

    createPointsWidget() {
        // Controlla se già esiste
        if (document.getElementById('cheersPointsWidget')) return;
        
        const widget = document.createElement('div');
        widget.id = 'cheersPointsWidget';
        widget.className = 'cheers-points-widget';
        widget.innerHTML = `
            <div class="points-content">
                <span class="points-icon">🎉</span>
                <span class="points-value" id="pointsValue">0</span>
                <span class="points-label">Cheers</span>
            </div>
        `;
        
        widget.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            cursor: pointer;
            transition: transform 0.3s ease;
        `;
        
        widget.addEventListener('mouseenter', () => {
            widget.style.transform = 'scale(1.05)';
        });
        
        widget.addEventListener('mouseleave', () => {
            widget.style.transform = 'scale(1)';
        });
        
        widget.addEventListener('click', () => {
            this.showGamificationModal();
        });
        
        document.body.appendChild(widget);
    }

    updatePointsDisplay() {
        const pointsElement = document.getElementById('pointsValue');
        if (pointsElement) {
            pointsElement.textContent = this.userPoints.toLocaleString();
        }
    }

    updateVibesDisplay() {
        const vibesElements = document.querySelectorAll('.vibes-fill');
        vibesElements.forEach(element => {
            element.style.width = `${this.vibesIndex}%`;
        });
    }

    updateAllDisplays() {
        this.updatePointsDisplay();
        this.updateVibesDisplay();
        this.updateBadgesDisplay();
    }

    updateBadgesDisplay() {
        const badgeContainers = document.querySelectorAll('.user-badges');
        badgeContainers.forEach(container => {
            container.innerHTML = this.userBadges.map(badgeId => {
                const badge = this.getBadgeInfo(badgeId);
                return `<span class="badge-mini" title="${badge.name}: ${badge.description}">${badge.icon}</span>`;
            }).join('');
        });
    }

    // Modal di Gamification
    showGamificationModal() {
        const modal = this.createGamificationModal();
        document.body.appendChild(modal);
        setTimeout(() => modal.style.display = 'flex', 10);
    }

    createGamificationModal() {
        const modal = document.createElement('div');
        modal.id = 'gamificationModal';
        modal.className = 'modal';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>🎮 Il Tuo Profilo Gamer</h3>
                    <button onclick="closeGamificationModal()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                
                <div class="gamification-tabs">
                    <button class="tab-button active" onclick="showGamificationTab('points')">Cheers Points</button>
                    <button class="tab-button" onclick="showGamificationTab('badges')">Badges</button>
                    <button class="tab-button" onclick="showGamificationTab('vibes')">Vibes Index</button>
                    <button class="tab-button" onclick="showGamificationTab('leaderboard')">Leaderboard</button>
                </div>
                
                <div id="pointsTab" class="gamification-tab-content">
                    ${this.createPointsTabContent()}
                </div>
                
                <div id="badgesTab" class="gamification-tab-content" style="display: none;">
                    ${this.createBadgesTabContent()}
                </div>
                
                <div id="vibesTab" class="gamification-tab-content" style="display: none;">
                    ${this.createVibesTabContent()}
                </div>
                
                <div id="leaderboardTab" class="gamification-tab-content" style="display: none;">
                    ${this.createLeaderboardTabContent()}
                </div>
            </div>
        `;
        
        return modal;
    }

    createPointsTabContent() {
        const nextLevelPoints = Math.pow(this.userLevel, 2) * 100;
        const progressPercent = ((this.userPoints % nextLevelPoints) / nextLevelPoints) * 100;
        
        return `
            <div style="text-align: center;">
                <div style="margin-bottom: 30px;">
                    <h2>${this.userPoints.toLocaleString()} 🎉</h2>
                    <p>Cheers Points</p>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4>Livello ${this.userLevel}</h4>
                    <div style="width: 100%; height: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; margin: 10px 0;">
                        <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 0.3s ease;"></div>
                    </div>
                    <p>Prossimo livello: ${nextLevelPoints - (this.userPoints % nextLevelPoints)} punti</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div style="padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                        <h4>Guadagna Punti</h4>
                        <ul style="text-align: left; padding-left: 20px;">
                            <li>Prenota evento: +50</li>
                            <li>Invita amici: +100</li>
                            <li>Recensione: +25</li>
                            <li>Check-in: +30</li>
                        </ul>
                    </div>
                    <div style="padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                        <h4>Premi Disponibili</h4>
                        <ul style="text-align: left; padding-left: 20px;">
                            <li>Drink gratis: 200pts</li>
                            <li>Ingresso VIP: 500pts</li>
                            <li>Tavolo riservato: 1000pts</li>
                            <li>Meet & Greet: 2000pts</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    createBadgesTabContent() {
        const allBadges = ['early_bird', 'social_butterfly', 'trend_setter', 'top_host', 'influencer', 'party_maker', 'venue_master', 'hospitality_pro', 'customer_favorite', 'performer', 'fan_favorite', 'rising_star'];
        
        return `
            <div>
                <h4 style="margin-bottom: 20px;">I Tuoi Badges (${this.userBadges.length}/${allBadges.length})</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    ${allBadges.map(badgeId => {
                        const badge = this.getBadgeInfo(badgeId);
                        const isUnlocked = this.userBadges.includes(badgeId);
                        
                        return `
                            <div style="padding: 15px; background: ${isUnlocked ? badge.color + '20' : 'rgba(255,255,255,0.05)'}; border-radius: 10px; text-align: center; opacity: ${isUnlocked ? '1' : '0.5'};">
                                <div style="font-size: 40px; margin-bottom: 10px;">${isUnlocked ? badge.icon : '🔒'}</div>
                                <h5>${badge.name}</h5>
                                <p style="font-size: 12px; opacity: 0.8;">${badge.description}</p>
                                ${isUnlocked ? '<small style="color: #2ecc71;">✓ Sbloccato</small>' : '<small>Bloccato</small>'}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    createVibesTabContent() {
        return `
            <div style="text-align: center;">
                <h4 style="margin-bottom: 20px;">Il Tuo Vibes Index</h4>
                
                <div style="margin-bottom: 30px;">
                    <div style="width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(from 0deg, #ff6b6b 0deg, #feca57 ${this.vibesIndex * 1.2}deg, rgba(255,255,255,0.1) ${this.vibesIndex * 1.2}deg); margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                        <div style="width: 160px; height: 160px; border-radius: 50%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; flex-direction: column;">
                            <h2>${this.vibesIndex}%</h2>
                            <p>Vibes Level</p>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                        <h4>🔥 Hype</h4>
                        <p>${Math.round(this.vibesIndex * 0.8)}%</p>
                    </div>
                    <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                        <h4>🎵 Music Match</h4>
                        <p>${Math.round(this.vibesIndex * 0.9)}%</p>
                    </div>
                    <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                        <h4>👥 Social</h4>
                        <p>${Math.round(this.vibesIndex * 1.1)}%</p>
                    </div>
                </div>
                
                <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                    <h4>Come aumentare i tuoi Vibes:</h4>
                    <ul style="text-align: left; padding-left: 20px;">
                        <li>Partecipa attivamente agli eventi</li>
                        <li>Condividi su Flir2night</li>
                        <li>Invita amici agli eventi</li>
                        <li>Lascia recensioni positive</li>
                    </ul>
                </div>
            </div>
        `;
    }

    createLeaderboardTabContent() {
        const leaderboard = this.generateMockLeaderboard();
        
        return `
            <div>
                <h4 style="margin-bottom: 20px;">Leaderboard - Top Players</h4>
                
                <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 20px;">
                    ${leaderboard.slice(0, 10).map((entry, index) => `
                        <div style="display: flex; align-items: center; padding: 10px; margin-bottom: 10px; background: ${entry.username === JSON.parse(localStorage.getItem('currentUser') || '{}').username ? 'rgba(255,107,107,0.2)' : 'rgba(255,255,255,0.02)'}; border-radius: 8px;">
                            <div style="width: 40px; text-align: center; font-weight: bold;">
                                ${entry.position <= 3 ? ['🥇', '🥈', '🥉'][entry.position - 1] : entry.position}
                            </div>
                            <div style="margin-left: 15px; flex: 1;">
                                <strong>${entry.username}</strong>
                                <small style="margin-left: 10px; opacity: 0.7;">Lv.${entry.level}</small>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-size: 20px; margin-right: 10px;">${entry.badge}</span>
                                <strong>${entry.points.toLocaleString()}</strong>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${this.leaderboardPosition ? `
                    <div style="margin-top: 20px; text-align: center; padding: 15px; background: rgba(255,107,107,0.1); border-radius: 10px;">
                        <h4>La Tua Posizione: #${this.leaderboardPosition}</h4>
                        <p>Continua così per scalare la classifica! 🚀</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Event Triggers per varie azioni
    triggerPointsEvent(amount, reason) {
        // Trigger per analytics o altri sistemi
        const event = new CustomEvent('cheersPointsEarned', {
            detail: { amount, reason, totalPoints: this.userPoints }
        });
        window.dispatchEvent(event);
    }

    // Integrazione con azioni specifiche dell'app
    initializeEventListeners() {
        // Listener per varie azioni che danno punti
        document.addEventListener('eventBooked', () => {
            this.addCheersPoints(50, 'Prenotazione evento');
        });
        
        document.addEventListener('reviewSubmitted', () => {
            this.addCheersPoints(25, 'Recensione lasciata');
        });
        
        document.addEventListener('friendInvited', () => {
            this.addCheersPoints(100, 'Amico invitato');
        });
        
        document.addEventListener('eventCheckedIn', () => {
            this.addCheersPoints(30, 'Check-in evento');
        });
    }

    // Salvataggio dati
    saveGamificationData() {
        const data = {
            points: this.userPoints,
            badges: this.userBadges,
            level: this.userLevel,
            vibesIndex: this.vibesIndex,
            leaderboardPosition: this.leaderboardPosition,
            achievements: this.achievements
        };
        
        localStorage.setItem('userGamificationData', JSON.stringify(data));
    }
}

// Funzioni globali per la gestione dei tab del modal
function showGamificationTab(tabName) {
    // Nascondi tutti i tab
    document.querySelectorAll('.gamification-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Rimuovi classe active da tutti i button
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostra il tab selezionato
    document.getElementById(tabName + 'Tab').style.display = 'block';
    
    // Aggiungi classe active al button
    event.target.classList.add('active');
}

function closeGamificationModal() {
    const modal = document.getElementById('gamificationModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

// CSS per i tab
const gamificationStyles = document.createElement('style');
gamificationStyles.textContent = `
    .gamification-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    
    .tab-button {
        background: none;
        border: none;
        color: rgba(255,255,255,0.7);
        padding: 10px 20px;
        cursor: pointer;
        border-radius: 8px 8px 0 0;
        transition: all 0.3s ease;
    }
    
    .tab-button.active {
        color: white;
        background: rgba(255,255,255,0.1);
        border-bottom: 2px solid #667eea;
    }
    
    .tab-button:hover {
        background: rgba(255,255,255,0.05);
    }
    
    .badge-mini {
        display: inline-block;
        margin: 2px;
        font-size: 16px;
        padding: 4px;
        border-radius: 50%;
        background: rgba(255,255,255,0.1);
    }
`;
document.head.appendChild(gamificationStyles);

// Inizializza il sistema quando la pagina è caricata
let gamificationSystem;
document.addEventListener('DOMContentLoaded', () => {
    gamificationSystem = new GamificationSystem();
});

// Export per uso in altri moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamificationSystem;
}