/**
 * POST-EVENT FEEDBACK SYSTEM
 * Sistema per raccogliere feedback organico dopo gli eventi
 */

class FeedbackSystem {
    constructor() {
        this.pendingFeedbacks = [];
        this.feedbackHistory = [];
        this.isInitialized = false;
        this.reminderTimeouts = new Map();
    }

    init() {
        this.loadPendingFeedbacks();
        this.scheduleAutomaticPrompts();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('📝 Sistema Feedback inizializzato');
    }

    // Programma feedback automatico per un evento
    scheduleEventFeedback(eventId, eventTitle, eventDate, userId) {
        const eventDateTime = new Date(eventDate);
        const promptTime = new Date(eventDateTime.getTime() + (12 * 60 * 60 * 1000)); // 12 ore dopo
        
        const feedback = {
            id: this.generateFeedbackId(),
            eventId,
            eventTitle,
            eventDate,
            userId,
            promptTime,
            status: 'scheduled',
            attempts: 0,
            maxAttempts: 3
        };

        this.pendingFeedbacks.push(feedback);
        this.savePendingFeedbacks();
        
        // Programma il prompt
        this.schedulePrompt(feedback);
        
        console.log(`📅 Feedback programmato per evento "${eventTitle}" - prompt alle ${promptTime.toLocaleString()}`);
    }

    schedulePrompt(feedback) {
        const now = new Date();
        const delay = feedback.promptTime.getTime() - now.getTime();
        
        if (delay > 0) {
            const timeoutId = setTimeout(() => {
                this.showFeedbackPrompt(feedback);
            }, delay);
            
            this.reminderTimeouts.set(feedback.id, timeoutId);
        } else {
            // Se l'orario è già passato, mostra immediatamente
            this.showFeedbackPrompt(feedback);
        }
    }

    scheduleAutomaticPrompts() {
        // Carica e programma tutti i feedback pendenti
        this.pendingFeedbacks.forEach(feedback => {
            if (feedback.status === 'scheduled' && feedback.attempts < feedback.maxAttempts) {
                this.schedulePrompt(feedback);
            }
        });
    }

    showFeedbackPrompt(feedback) {
        // Verifica se l'utente è online/attivo
        if (!document.hasFocus()) {
            // Riprogramma tra 30 minuti se l'utente non è attivo
            const retryTime = new Date(Date.now() + (30 * 60 * 1000));
            feedback.promptTime = retryTime;
            feedback.attempts++;
            
            if (feedback.attempts < feedback.maxAttempts) {
                this.schedulePrompt(feedback);
            }
            return;
        }

        // Mostra il modal di feedback
        this.displayFeedbackModal(feedback);
        
        // Aggiorna lo stato
        feedback.status = 'prompted';
        feedback.attempts++;
        this.savePendingFeedbacks();
    }

    displayFeedbackModal(feedback) {
        const modal = this.createFeedbackModal(feedback);
        document.body.appendChild(modal);
        
        // Mostra con animazione
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    createFeedbackModal(feedback) {
        const modal = document.createElement('div');
        modal.className = 'feedback-modal-overlay';
        modal.innerHTML = `
            <div class="feedback-modal">
                <div class="feedback-header">
                    <h3>🎉 Come ti sei trovato?</h3>
                    <p>Racconta la tua esperienza a "${feedback.eventTitle}"</p>
                </div>
                
                <div class="feedback-content">
                    <!-- Overall Rating -->
                    <div class="rating-section">
                        <label>Esperienza Generale</label>
                        <div class="star-rating" data-rating="overall">
                            ${this.createStarRating('overall')}
                        </div>
                        <div class="emoji-rating" data-rating="overall">
                            ${this.createEmojiRating()}
                        </div>
                    </div>

                    <!-- Specific Ratings -->
                    <div class="specific-ratings">
                        <div class="rating-item">
                            <label>🎵 Musica</label>
                            <div class="star-rating" data-rating="music">
                                ${this.createStarRating('music')}
                            </div>
                        </div>
                        
                        <div class="rating-item">
                            <label>📍 Location</label>
                            <div class="star-rating" data-rating="location">
                                ${this.createStarRating('location')}
                            </div>
                        </div>
                        
                        <div class="rating-item">
                            <label>🎭 Atmosfera</label>
                            <div class="star-rating" data-rating="atmosphere">
                                ${this.createStarRating('atmosphere')}
                            </div>
                        </div>
                        
                        <div class="rating-item">
                            <label>👥 Compagnia</label>
                            <div class="star-rating" data-rating="company">
                                ${this.createStarRating('company')}
                            </div>
                        </div>
                    </div>

                    <!-- Written Feedback -->
                    <div class="comment-section">
                        <label>💭 Racconta di più (opzionale)</label>
                        <textarea 
                            id="feedbackComment" 
                            placeholder="Cosa ti è piaciuto di più? Qualcosa da migliorare?"
                            maxlength="500"
                        ></textarea>
                        <div class="char-counter">0/500</div>
                    </div>

                    <!-- Quick Tags -->
                    <div class="quick-tags-section">
                        <label>🏷️ Tag veloci</label>
                        <div class="quick-tags">
                            <button class="tag-btn" data-tag="ottima-musica">🎵 Ottima musica</button>
                            <button class="tag-btn" data-tag="bella-gente">👥 Bella gente</button>
                            <button class="tag-btn" data-tag="prezzo-giusto">💰 Prezzo giusto</button>
                            <button class="tag-btn" data-tag="locale-bello">🏢 Locale bello</button>
                            <button class="tag-btn" data-tag="servizio-top">⭐ Servizio top</button>
                            <button class="tag-btn" data-tag="troppo-affollato">👥 Troppo affollato</button>
                            <button class="tag-btn" data-tag="caro">💸 Caro</button>
                            <button class="tag-btn" data-tag="musica-alta">🔊 Musica alta</button>
                        </div>
                    </div>

                    <!-- Photo Upload -->
                    <div class="photo-upload-section">
                        <label>📸 Condividi una foto (opzionale)</label>
                        <div class="photo-upload-area">
                            <input type="file" id="feedbackPhoto" accept="image/*" style="display: none;">
                            <button class="upload-btn" onclick="document.getElementById('feedbackPhoto').click()">
                                📷 Aggiungi Foto
                            </button>
                            <div id="photoPreview" class="photo-preview"></div>
                        </div>
                    </div>
                </div>

                <div class="feedback-actions">
                    <button class="btn-secondary" onclick="feedbackSystem.dismissFeedback('${feedback.id}')">
                        Forse dopo
                    </button>
                    <button class="btn-primary" onclick="feedbackSystem.submitFeedback('${feedback.id}')">
                        Invia Feedback
                    </button>
                </div>
            </div>
        `;

        // Add styles
        this.addFeedbackStyles();
        
        // Setup event listeners
        this.setupModalEventListeners(modal, feedback);
        
        return modal;
    }

    createStarRating(category) {
        return Array.from({length: 5}, (_, i) => 
            `<span class="star" data-value="${i + 1}">⭐</span>`
        ).join('');
    }

    createEmojiRating() {
        const emojis = [
            { emoji: '😡', label: 'Pessimo' },
            { emoji: '😕', label: 'Così così' },
            { emoji: '😐', label: 'Ok' },
            { emoji: '😊', label: 'Buono' },
            { emoji: '🤩', label: 'Fantastico' }
        ];

        return emojis.map((item, i) => 
            `<button class="emoji-btn" data-value="${i + 1}" title="${item.label}">
                ${item.emoji}
            </button>`
        ).join('');
    }

    setupModalEventListeners(modal, feedback) {
        // Star ratings
        modal.querySelectorAll('.star-rating').forEach(rating => {
            const stars = rating.querySelectorAll('.star');
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    const value = index + 1;
                    const category = rating.getAttribute('data-rating');
                    this.setRating(category, value, rating);
                });

                star.addEventListener('mouseenter', () => {
                    this.highlightStars(rating, index + 1);
                });
            });

            rating.addEventListener('mouseleave', () => {
                this.resetStarHighlight(rating);
            });
        });

        // Emoji rating
        modal.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = parseInt(btn.getAttribute('data-value'));
                modal.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                feedback.overallRating = value;
            });
        });

        // Quick tags
        modal.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('selected');
            });
        });

        // Character counter
        const textarea = modal.querySelector('#feedbackComment');
        const counter = modal.querySelector('.char-counter');
        textarea.addEventListener('input', () => {
            const length = textarea.value.length;
            counter.textContent = `${length}/500`;
            counter.style.color = length > 450 ? '#ff6b6b' : '#888';
        });

        // Photo upload
        const photoInput = modal.querySelector('#feedbackPhoto');
        const photoPreview = modal.querySelector('#photoPreview');
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    photoPreview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview" style="max-width: 200px; border-radius: 8px;">
                        <button class="remove-photo" onclick="this.parentElement.innerHTML=''">❌</button>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.dismissFeedback(feedback.id);
            }
        });
    }

    setRating(category, value, ratingElement) {
        // Update visual feedback
        const stars = ratingElement.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.toggle('selected', index < value);
        });

        // Store rating
        if (!this.currentRatings) this.currentRatings = {};
        this.currentRatings[category] = value;
    }

    highlightStars(ratingElement, value) {
        const stars = ratingElement.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.toggle('hover', index < value);
        });
    }

    resetStarHighlight(ratingElement) {
        const stars = ratingElement.querySelectorAll('.star');
        stars.forEach(star => star.classList.remove('hover'));
    }

    async submitFeedback(feedbackId) {
        const modal = document.querySelector('.feedback-modal-overlay');
        const feedback = this.pendingFeedbacks.find(f => f.id === feedbackId);
        
        if (!feedback) return;

        // Collect all feedback data
        const feedbackData = {
            feedbackId,
            eventId: feedback.eventId,
            eventTitle: feedback.eventTitle,
            userId: feedback.userId,
            timestamp: new Date().toISOString(),
            ratings: this.currentRatings || {},
            overallRating: feedback.overallRating || 0,
            comment: modal.querySelector('#feedbackComment').value,
            tags: Array.from(modal.querySelectorAll('.tag-btn.selected')).map(btn => btn.getAttribute('data-tag')),
            hasPhoto: modal.querySelector('#photoPreview img') !== null
        };

        // Validate minimum requirements
        if (!feedbackData.overallRating && Object.keys(feedbackData.ratings).length === 0) {
            window.app.showToast('⭐ Dai almeno una valutazione per continuare', 'warning');
            return;
        }

        try {
            // Show loading
            window.app.showToast('📝 Invio feedback...', 'info');
            
            // Submit to backend
            await this.saveFeedbackToBackend(feedbackData);
            
            // Upload photo if present
            if (feedbackData.hasPhoto) {
                await this.uploadFeedbackPhoto(feedbackId, modal.querySelector('#photoPreview img').src);
            }
            
            // Remove from pending
            this.pendingFeedbacks = this.pendingFeedbacks.filter(f => f.id !== feedbackId);
            this.savePendingFeedbacks();
            
            // Add to history
            this.feedbackHistory.push(feedbackData);
            this.saveFeedbackHistory();
            
            // Update Vibes Index
            if (window.gamificationSystem) {
                window.gamificationSystem.updateVibesIndex(feedback.eventId, feedbackData.overallRating);
            }
            
            // Award points
            if (window.gamificationSystem) {
                window.gamificationSystem.addCheersPoints(25, 'Feedback evento');
            }
            
            // Close modal
            this.closeFeedbackModal(modal);
            
            window.app.showToast('🎉 Grazie per il tuo feedback!', 'success');
            
        } catch (error) {
            console.error('Errore invio feedback:', error);
            window.app.showToast('❌ Errore invio feedback. Riprova.', 'error');
        }
    }

    async saveFeedbackToBackend(feedbackData) {
        // In production, this would call your API
        const response = await fetch('/.netlify/functions/save-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save feedback');
        }
        
        return response.json();
    }

    async uploadFeedbackPhoto(feedbackId, photoDataUrl) {
        // Convert data URL to blob
        const response = await fetch(photoDataUrl);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('feedbackId', feedbackId);
        formData.append('photo', blob, 'feedback-photo.jpg');
        
        const uploadResponse = await fetch('/.netlify/functions/upload-feedback-photo', {
            method: 'POST',
            body: formData
        });
        
        if (!uploadResponse.ok) {
            throw new Error('Failed to upload photo');
        }
        
        return uploadResponse.json();
    }

    dismissFeedback(feedbackId) {
        const feedback = this.pendingFeedbacks.find(f => f.id === feedbackId);
        if (!feedback) return;
        
        // Riprogramma per domani se non ha raggiunto il limite
        if (feedback.attempts < feedback.maxAttempts) {
            feedback.promptTime = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 ore dopo
            feedback.status = 'scheduled';
            this.schedulePrompt(feedback);
        } else {
            // Rimuovi se ha raggiunto il limite
            this.pendingFeedbacks = this.pendingFeedbacks.filter(f => f.id !== feedbackId);
        }
        
        this.savePendingFeedbacks();
        
        // Chiudi modal
        const modal = document.querySelector('.feedback-modal-overlay');
        this.closeFeedbackModal(modal);
    }

    closeFeedbackModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
        
        // Reset ratings
        this.currentRatings = {};
    }

    // Utilities
    generateFeedbackId() {
        return 'feedback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    loadPendingFeedbacks() {
        const saved = localStorage.getItem('ma-che-serata-pending-feedbacks');
        if (saved) {
            this.pendingFeedbacks = JSON.parse(saved).map(f => ({
                ...f,
                promptTime: new Date(f.promptTime)
            }));
        }
    }

    savePendingFeedbacks() {
        localStorage.setItem('ma-che-serata-pending-feedbacks', JSON.stringify(this.pendingFeedbacks));
    }

    loadFeedbackHistory() {
        const saved = localStorage.getItem('ma-che-serata-feedback-history');
        if (saved) {
            this.feedbackHistory = JSON.parse(saved);
        }
    }

    saveFeedbackHistory() {
        localStorage.setItem('ma-che-serata-feedback-history', JSON.stringify(this.feedbackHistory));
    }

    setupEventListeners() {
        // Listen for event bookings to schedule feedback
        window.addEventListener('eventBooked', (event) => {
            const { eventId, eventTitle, eventDate, userId } = event.detail;
            this.scheduleEventFeedback(eventId, eventTitle, eventDate, userId);
        });
    }

    addFeedbackStyles() {
        if (document.getElementById('feedback-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'feedback-styles';
        styles.textContent = `
            .feedback-modal-overlay {
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

            .feedback-modal-overlay.show {
                opacity: 1;
            }

            .feedback-modal {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border-radius: 20px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid rgba(255,255,255,0.1);
                transform: translateY(-20px);
                transition: transform 0.3s ease;
            }

            .feedback-modal-overlay.show .feedback-modal {
                transform: translateY(0);
            }

            .feedback-header {
                text-align: center;
                margin-bottom: 2rem;
                color: white;
            }

            .feedback-header h3 {
                margin: 0 0 0.5rem 0;
                font-size: 1.5rem;
            }

            .feedback-header p {
                margin: 0;
                opacity: 0.8;
            }

            .rating-section {
                margin-bottom: 2rem;
                text-align: center;
            }

            .rating-section label {
                display: block;
                color: white;
                margin-bottom: 1rem;
                font-weight: bold;
            }

            .star-rating {
                display: flex;
                justify-content: center;
                gap: 5px;
                margin-bottom: 1rem;
            }

            .star {
                font-size: 2rem;
                cursor: pointer;
                opacity: 0.3;
                transition: all 0.2s ease;
            }

            .star.selected,
            .star.hover {
                opacity: 1;
                transform: scale(1.1);
            }

            .emoji-rating {
                display: flex;
                justify-content: center;
                gap: 10px;
            }

            .emoji-btn {
                background: rgba(255,255,255,0.1);
                border: 2px solid transparent;
                border-radius: 50px;
                padding: 10px;
                font-size: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .emoji-btn:hover,
            .emoji-btn.selected {
                border-color: #ffd700;
                background: rgba(255,215,0,0.2);
                transform: scale(1.1);
            }

            .specific-ratings {
                margin-bottom: 2rem;
            }

            .rating-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 1rem;
                color: white;
            }

            .rating-item label {
                margin: 0;
                font-size: 0.9rem;
            }

            .rating-item .star-rating {
                margin: 0;
                gap: 3px;
            }

            .rating-item .star {
                font-size: 1rem;
            }

            .comment-section {
                margin-bottom: 2rem;
            }

            .comment-section label {
                display: block;
                color: white;
                margin-bottom: 0.5rem;
                font-weight: bold;
            }

            .comment-section textarea {
                width: 100%;
                min-height: 80px;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 10px;
                color: white;
                padding: 1rem;
                resize: vertical;
                font-family: inherit;
            }

            .comment-section textarea::placeholder {
                color: rgba(255,255,255,0.5);
            }

            .char-counter {
                text-align: right;
                font-size: 0.8rem;
                color: #888;
                margin-top: 0.5rem;
            }

            .quick-tags-section {
                margin-bottom: 2rem;
            }

            .quick-tags-section label {
                display: block;
                color: white;
                margin-bottom: 1rem;
                font-weight: bold;
            }

            .quick-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .tag-btn {
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 20px;
                color: white;
                padding: 0.5rem 1rem;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .tag-btn:hover,
            .tag-btn.selected {
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                border-color: transparent;
            }

            .photo-upload-section {
                margin-bottom: 2rem;
            }

            .photo-upload-section label {
                display: block;
                color: white;
                margin-bottom: 1rem;
                font-weight: bold;
            }

            .upload-btn {
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 10px;
                color: white;
                padding: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                width: 100%;
            }

            .upload-btn:hover {
                background: rgba(255,255,255,0.2);
            }

            .photo-preview {
                margin-top: 1rem;
                position: relative;
            }

            .remove-photo {
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(0,0,0,0.7);
                border: none;
                border-radius: 50%;
                width: 25px;
                height: 25px;
                cursor: pointer;
                font-size: 0.8rem;
            }

            .feedback-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
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

            .btn-secondary:hover {
                background: rgba(255,255,255,0.2);
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }

            @media (max-width: 768px) {
                .feedback-modal {
                    margin: 1rem;
                    padding: 1.5rem;
                }
                
                .feedback-actions {
                    flex-direction: column;
                }
                
                .quick-tags {
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Analytics methods
    getFeedbackAnalytics() {
        return {
            totalFeedbacks: this.feedbackHistory.length,
            averageRating: this.calculateAverageRating(),
            ratingDistribution: this.getRatingDistribution(),
            topTags: this.getTopTags(),
            recentFeedbacks: this.feedbackHistory.slice(-10)
        };
    }

    calculateAverageRating() {
        if (this.feedbackHistory.length === 0) return 0;
        
        const total = this.feedbackHistory.reduce((sum, feedback) => {
            return sum + (feedback.overallRating || 0);
        }, 0);
        
        return (total / this.feedbackHistory.length).toFixed(1);
    }

    getRatingDistribution() {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        this.feedbackHistory.forEach(feedback => {
            const rating = feedback.overallRating || 0;
            if (rating >= 1 && rating <= 5) {
                distribution[rating]++;
            }
        });
        
        return distribution;
    }

    getTopTags() {
        const tagCounts = {};
        
        this.feedbackHistory.forEach(feedback => {
            feedback.tags?.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
    }
}

// Initialize global feedback system
window.feedbackSystem = new FeedbackSystem();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.feedbackSystem.init();
});