/**
 * PUSH NOTIFICATIONS SYSTEM (PWA)
 * Sistema notifiche push per engagement e retention
 */

class PushNotificationSystem {
    constructor() {
        this.isSupported = false;
        this.isSubscribed = false;
        this.subscription = null;
        this.vapidKey = 'BMqHnuI5O2eQfZ8lV4cZf8OGsZq7L4JYzXMp3O9QrJKvP8qL4Rz9B3aPcN2zV5tW7yE6nX1mK8hJ4pL3qR9sA'; // Mock VAPID key
        this.oneSignalAppId = 'your-onesignal-app-id'; // Replace with real OneSignal App ID
        this.notificationQueue = [];
        this.settings = {
            events: true,
            bookings: true,
            social: true,
            marketing: false,
            dailyUpdates: true
        };
    }

    async init() {
        this.checkSupport();
        this.loadSettings();
        
        if (this.isSupported) {
            await this.initializeServiceWorker();
            await this.checkSubscriptionStatus();
            this.setupEventListeners();
            this.schedulePeriodicNotifications();
        }
        
        console.log(`🔔 Sistema notifiche inizializzato - Supporto: ${this.isSupported}`);
    }

    checkSupport() {
        this.isSupported = (
            'serviceWorker' in navigator &&
            'PushManager' in window &&
            'Notification' in window
        );
    }

    async initializeServiceWorker() {
        try {
            // Register service worker if not already registered
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registrato:', registration);
            
            // Create service worker file if it doesn't exist
            this.createServiceWorkerFile();
            
            return registration;
        } catch (error) {
            console.error('Errore registrazione Service Worker:', error);
            throw error;
        }
    }

    createServiceWorkerFile() {
        // This would typically be a separate sw.js file
        // For demo purposes, we'll create it dynamically
        const swContent = `
            // Service Worker for Push Notifications
            self.addEventListener('push', function(event) {
                const options = {
                    body: event.data ? event.data.text() : 'Nuovo aggiornamento da Ma Che Serata!',
                    icon: '/icon-192.png',
                    badge: '/badge-72.png',
                    vibrate: [100, 50, 100],
                    data: {
                        dateOfArrival: Date.now(),
                        primaryKey: 1
                    },
                    actions: [
                        {
                            action: 'explore',
                            title: 'Vai all\\'app',
                            icon: '/icon-192.png'
                        },
                        {
                            action: 'close',
                            title: 'Chiudi',
                            icon: '/icon-192.png'
                        }
                    ]
                };
                
                event.waitUntil(
                    self.registration.showNotification('Ma Che Serata', options)
                );
            });
            
            self.addEventListener('notificationclick', function(event) {
                event.notification.close();
                
                if (event.action === 'explore') {
                    event.waitUntil(
                        clients.openWindow('/')
                    );
                } else if (event.action === 'close') {
                    // Just close the notification
                }
            });
        `;
        
        // In a real app, this file would be static
        console.log('Service Worker content created');
    }

    async checkSubscriptionStatus() {
        try {
            const registration = await navigator.serviceWorker.ready;
            this.subscription = await registration.pushManager.getSubscription();
            this.isSubscribed = this.subscription !== null;
            
            if (this.isSubscribed) {
                console.log('🔔 Utente già iscritto alle notifiche');
                this.sendSubscriptionToServer(this.subscription);
            }
        } catch (error) {
            console.error('Errore verifica subscription:', error);
        }
    }

    async requestNotificationPermission() {
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission === 'denied') {
            window.app.showToast('❌ Notifiche bloccate. Abilitale nelle impostazioni del browser.', 'error');
            return false;
        }
        
        // Show custom permission modal first
        const userWantsNotifications = await this.showPermissionModal();
        
        if (!userWantsNotifications) {
            return false;
        }
        
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            window.app.showToast('🔔 Notifiche abilitate con successo!', 'success');
            return true;
        } else {
            window.app.showToast('❌ Permesso notifiche negato', 'error');
            return false;
        }
    }

    showPermissionModal() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'notification-permission-modal';
            modal.innerHTML = `
                <div class="permission-modal-content">
                    <div class="permission-header">
                        <h3>🔔 Attiva le Notifiche</h3>
                        <p>Rimani sempre aggiornato sui tuoi eventi preferiti!</p>
                    </div>
                    
                    <div class="permission-benefits">
                        <div class="benefit-item">
                            <span class="benefit-icon">🎉</span>
                            <span>Nuovi eventi nella tua zona</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">⏰</span>
                            <span>Promemoria eventi prenotati</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">🎁</span>
                            <span>Offerte esclusive e sconti</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">⭐</span>
                            <span>Aggiornamenti Cheers Points</span>
                        </div>
                    </div>
                    
                    <div class="permission-actions">
                        <button class="btn-secondary" onclick="resolve(false)">Non ora</button>
                        <button class="btn-primary" onclick="resolve(true)">Attiva Notifiche</button>
                    </div>
                </div>
            `;
            
            // Add styles
            this.addPermissionModalStyles();
            
            // Setup event handlers
            modal.querySelectorAll('button').forEach(btn => {
                btn.onclick = () => {
                    const result = btn.textContent.includes('Attiva');
                    modal.remove();
                    resolve(result);
                };
            });
            
            document.body.appendChild(modal);
            
            // Show with animation
            setTimeout(() => modal.classList.add('show'), 100);
        });
    }

    async subscribeUser() {
        try {
            const permissionGranted = await this.requestNotificationPermission();
            if (!permissionGranted) return false;
            
            const registration = await navigator.serviceWorker.ready;
            
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.vapidKey)
            });
            
            this.subscription = subscription;
            this.isSubscribed = true;
            
            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);
            
            // Save locally
            this.saveSubscriptionLocally(subscription);
            
            // Send welcome notification
            this.scheduleWelcomeNotification();
            
            window.app.showToast('🎉 Notifiche attivate con successo!', 'success');
            
            return true;
            
        } catch (error) {
            console.error('Errore sottoscrizione notifiche:', error);
            window.app.showToast('❌ Errore attivazione notifiche', 'error');
            return false;
        }
    }

    async unsubscribeUser() {
        try {
            if (!this.subscription) return true;
            
            const unsubscribed = await this.subscription.unsubscribe();
            
            if (unsubscribed) {
                this.subscription = null;
                this.isSubscribed = false;
                
                // Remove from server
                await this.removeSubscriptionFromServer();
                
                // Remove locally
                localStorage.removeItem('ma-che-serata-push-subscription');
                
                window.app.showToast('🔕 Notifiche disattivate', 'info');
            }
            
            return unsubscribed;
            
        } catch (error) {
            console.error('Errore rimozione sottoscrizione:', error);
            return false;
        }
    }

    async sendSubscriptionToServer(subscription) {
        try {
            const response = await fetch('/.netlify/functions/save-push-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    userId: this.getCurrentUserId(),
                    settings: this.settings,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save subscription');
            }
            
            console.log('✅ Subscription salvata sul server');
            
        } catch (error) {
            console.error('Errore salvataggio subscription:', error);
            // Fallback: save locally
            this.saveSubscriptionLocally(subscription);
        }
    }

    async removeSubscriptionFromServer() {
        try {
            await fetch('/.netlify/functions/remove-push-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.getCurrentUserId()
                })
            });
            
            console.log('✅ Subscription rimossa dal server');
            
        } catch (error) {
            console.error('Errore rimozione subscription:', error);
        }
    }

    saveSubscriptionLocally(subscription) {
        localStorage.setItem('ma-che-serata-push-subscription', JSON.stringify({
            subscription: subscription.toJSON(),
            timestamp: new Date().toISOString()
        }));
    }

    // Notification Types and Triggers
    async sendEventNotification(eventData) {
        if (!this.settings.events || !this.isSubscribed) return;
        
        const notification = {
            title: '🎉 Nuovo Evento!',
            body: `${eventData.title} - ${eventData.date}`,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: {
                type: 'event',
                eventId: eventData.id,
                url: `/event/${eventData.id}`
            },
            actions: [
                { action: 'view', title: 'Visualizza' },
                { action: 'book', title: 'Prenota' }
            ]
        };
        
        await this.sendNotification(notification);
    }

    async sendBookingReminder(bookingData) {
        if (!this.settings.bookings || !this.isSubscribed) return;
        
        const notification = {
            title: '⏰ Promemoria Evento',
            body: `Il tuo evento "${bookingData.eventTitle}" inizia tra 2 ore!`,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: {
                type: 'reminder',
                bookingId: bookingData.id,
                url: `/booking/${bookingData.id}`
            },
            actions: [
                { action: 'directions', title: 'Indicazioni' },
                { action: 'details', title: 'Dettagli' }
            ]
        };
        
        await this.sendNotification(notification);
    }

    async sendCheersPointsUpdate(pointsData) {
        if (!this.settings.social || !this.isSubscribed) return;
        
        const notification = {
            title: '⭐ Cheers Points!',
            body: `Hai guadagnato ${pointsData.points} punti! ${pointsData.reason}`,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: {
                type: 'points',
                points: pointsData.points,
                url: '/dashboard#gamification'
            }
        };
        
        await this.sendNotification(notification);
    }

    async sendSocialNotification(socialData) {
        if (!this.settings.social || !this.isSubscribed) return;
        
        const notification = {
            title: '👥 Attività Sociale',
            body: socialData.message,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: {
                type: 'social',
                url: socialData.url || '/dashboard'
            }
        };
        
        await this.sendNotification(notification);
    }

    async sendDailyUpdate() {
        if (!this.settings.dailyUpdates || !this.isSubscribed) return;
        
        const stats = await this.getDailyStats();
        
        const notification = {
            title: '📊 Il Tuo Riepilogo Giornaliero',
            body: `${stats.newEvents} nuovi eventi, ${stats.cheersPoints} punti guadagnati`,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: {
                type: 'daily',
                url: '/dashboard'
            }
        };
        
        await this.sendNotification(notification);
    }

    async sendNotification(notificationData) {
        try {
            // For demo purposes, we'll show a local notification
            // In production, this would send to your push service
            
            if (Notification.permission === 'granted') {
                const notification = new Notification(notificationData.title, {
                    body: notificationData.body,
                    icon: notificationData.icon,
                    badge: notificationData.badge,
                    data: notificationData.data,
                    requireInteraction: true,
                    silent: false
                });
                
                notification.onclick = () => {
                    window.focus();
                    if (notificationData.data?.url) {
                        window.location.href = notificationData.data.url;
                    }
                    notification.close();
                };
                
                // Auto close after 10 seconds
                setTimeout(() => notification.close(), 10000);
            }
            
            // Add to notification history
            this.addToNotificationHistory(notificationData);
            
        } catch (error) {
            console.error('Errore invio notifica:', error);
        }
    }

    // Scheduling and Automation
    schedulePeriodicNotifications() {
        // Daily update at 9 AM
        this.scheduleDailyNotification();
        
        // Event reminders
        this.scheduleEventReminders();
        
        // Re-engagement notifications
        this.scheduleReEngagementNotifications();
    }

    scheduleDailyNotification() {
        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(9, 0, 0, 0);
        
        if (targetTime <= now) {
            targetTime.setDate(targetTime.getDate() + 1);
        }
        
        const delay = targetTime.getTime() - now.getTime();
        
        setTimeout(() => {
            this.sendDailyUpdate();
            // Reschedule for next day
            setInterval(() => this.sendDailyUpdate(), 24 * 60 * 60 * 1000);
        }, delay);
    }

    scheduleEventReminders() {
        // This would typically check user's bookings and schedule reminders
        // For demo, we'll simulate
        const mockBookings = this.getMockUserBookings();
        
        mockBookings.forEach(booking => {
            const eventTime = new Date(booking.eventDate);
            const reminderTime = new Date(eventTime.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before
            const now = new Date();
            
            if (reminderTime > now) {
                const delay = reminderTime.getTime() - now.getTime();
                setTimeout(() => {
                    this.sendBookingReminder(booking);
                }, delay);
            }
        });
    }

    scheduleReEngagementNotifications() {
        // Send re-engagement notification if user hasn't used app for 3 days
        const lastActivity = localStorage.getItem('ma-che-serata-last-activity');
        if (!lastActivity) return;
        
        const lastActivityDate = new Date(lastActivity);
        const threeDaysAgo = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000));
        
        if (lastActivityDate < threeDaysAgo) {
            setTimeout(() => {
                this.sendReEngagementNotification();
            }, 60000); // Send after 1 minute
        }
    }

    async sendReEngagementNotification() {
        const notification = {
            title: '🎭 Ti mancano gli eventi?',
            body: 'Scopri i nuovi eventi nella tua zona! Non perdere le migliori serate.',
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: {
                type: 're-engagement',
                url: '/'
            }
        };
        
        await this.sendNotification(notification);
    }

    scheduleWelcomeNotification() {
        setTimeout(() => {
            const notification = {
                title: '🎉 Benvenuto in Ma Che Serata!',
                body: 'Riceverai notifiche per eventi, promemoria e aggiornamenti. Buon divertimento!',
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                data: {
                    type: 'welcome',
                    url: '/dashboard'
                }
            };
            
            this.sendNotification(notification);
        }, 5000); // 5 seconds after subscription
    }

    // Settings Management
    updateNotificationSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Update server
        if (this.isSubscribed) {
            this.sendSubscriptionToServer(this.subscription);
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('ma-che-serata-notification-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    saveSettings() {
        localStorage.setItem('ma-che-serata-notification-settings', JSON.stringify(this.settings));
    }

    // Event Listeners
    setupEventListeners() {
        // Listen for events that should trigger notifications
        window.addEventListener('eventBooked', (event) => {
            const { eventData, userId } = event.detail;
            if (userId === this.getCurrentUserId()) {
                this.scheduleBookingReminder({
                    id: `booking_${Date.now()}`,
                    eventTitle: eventData.title,
                    eventDate: eventData.date
                });
            }
        });
        
        window.addEventListener('pointsEarned', (event) => {
            const { points, reason } = event.detail;
            this.sendCheersPointsUpdate({ points, reason });
        });
        
        window.addEventListener('newEventCreated', (event) => {
            const { eventData } = event.detail;
            this.sendEventNotification(eventData);
        });
        
        // Track user activity
        ['click', 'scroll', 'keypress'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                localStorage.setItem('ma-che-serata-last-activity', new Date().toISOString());
            });
        });
    }

    // Utility Methods
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    getCurrentUserId() {
        // Mock user ID - in production, get from auth system
        return localStorage.getItem('ma-che-serata-user-id') || 'user_' + Date.now();
    }

    addToNotificationHistory(notification) {
        const history = JSON.parse(localStorage.getItem('ma-che-serata-notification-history') || '[]');
        history.unshift({
            ...notification,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        // Keep only last 50 notifications
        history.splice(50);
        
        localStorage.setItem('ma-che-serata-notification-history', JSON.stringify(history));
    }

    getNotificationHistory() {
        return JSON.parse(localStorage.getItem('ma-che-serata-notification-history') || '[]');
    }

    getMockUserBookings() {
        // Mock bookings for demo
        return [
            {
                id: 'booking_1',
                eventTitle: 'Aperitivo Trendy',
                eventDate: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString() // Tomorrow
            }
        ];
    }

    async getDailyStats() {
        // Mock daily stats
        return {
            newEvents: Math.floor(Math.random() * 10) + 1,
            cheersPoints: Math.floor(Math.random() * 50) + 10,
            newMessages: Math.floor(Math.random() * 5)
        };
    }

    addPermissionModalStyles() {
        if (document.getElementById('permission-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'permission-modal-styles';
        styles.textContent = `
            .notification-permission-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                backdrop-filter: blur(5px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .notification-permission-modal.show {
                opacity: 1;
            }
            
            .permission-modal-content {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border-radius: 20px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                border: 1px solid rgba(255,255,255,0.1);
                transform: translateY(-20px);
                transition: transform 0.3s ease;
            }
            
            .notification-permission-modal.show .permission-modal-content {
                transform: translateY(0);
            }
            
            .permission-header {
                text-align: center;
                margin-bottom: 2rem;
                color: white;
            }
            
            .permission-header h3 {
                margin: 0 0 0.5rem 0;
                font-size: 1.5rem;
            }
            
            .permission-benefits {
                margin-bottom: 2rem;
            }
            
            .benefit-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
                color: white;
                font-size: 0.9rem;
            }
            
            .benefit-icon {
                font-size: 1.2rem;
                width: 2rem;
                text-align: center;
            }
            
            .permission-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
            
            .btn-secondary,
            .btn-primary {
                padding: 1rem 1.5rem;
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
            
            .btn-secondary:hover {
                background: rgba(255,255,255,0.2);
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Public API for settings UI
    createNotificationSettingsUI() {
        return `
            <div class="notification-settings">
                <h3>🔔 Impostazioni Notifiche</h3>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" ${this.settings.events ? 'checked' : ''} 
                               onchange="pushNotificationSystem.updateNotificationSettings({events: this.checked})">
                        🎉 Nuovi eventi
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" ${this.settings.bookings ? 'checked' : ''} 
                               onchange="pushNotificationSystem.updateNotificationSettings({bookings: this.checked})">
                        ⏰ Promemoria prenotazioni
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" ${this.settings.social ? 'checked' : ''} 
                               onchange="pushNotificationSystem.updateNotificationSettings({social: this.checked})">
                        👥 Attività sociale
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" ${this.settings.marketing ? 'checked' : ''} 
                               onchange="pushNotificationSystem.updateNotificationSettings({marketing: this.checked})">
                        🎁 Offerte e promozioni
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" ${this.settings.dailyUpdates ? 'checked' : ''} 
                               onchange="pushNotificationSystem.updateNotificationSettings({dailyUpdates: this.checked})">
                        📊 Aggiornamenti giornalieri
                    </label>
                </div>
                
                <div class="subscription-controls">
                    ${this.isSubscribed ? 
                        '<button class="btn-danger" onclick="pushNotificationSystem.unsubscribeUser()">🔕 Disabilita Notifiche</button>' :
                        '<button class="btn-primary" onclick="pushNotificationSystem.subscribeUser()">🔔 Abilita Notifiche</button>'
                    }
                </div>
            </div>
        `;
    }
}

// Initialize global push notification system
window.pushNotificationSystem = new PushNotificationSystem();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pushNotificationSystem.init();
});