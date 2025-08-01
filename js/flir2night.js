// Ma Che Serata - Flir2night Community Forum
class Flir2nightForum {
    constructor() {
        this.posts = [];
        this.categories = [];
        this.currentFilter = 'all';
        this.currentSort = 'recent';
        this.currentView = 'list';
        this.currentPage = 1;
        this.postsPerPage = 10;
        this.init();
    }

    init() {
        this.loadMockData();
        this.bindEvents();
        this.renderCategories();
        this.renderPosts();
        this.renderTopContributors();
    }

    bindEvents() {
        // Category filter buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterByCategory(e.target.dataset.category);
            });
        });

        // Sort and filter controls
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderPosts();
            });
        }

        const filterSelect = document.getElementById('filterSelect');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderPosts();
            });
        }

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.target.dataset.view);
            });
        });

        // Create post button
        const createPostBtn = document.getElementById('createPostBtn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => {
                this.showCreatePostModal();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('forumSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchPosts(e.target.value);
                }, 300);
            });
        }

        // Create post form
        const createPostForm = document.getElementById('createPostForm');
        if (createPostForm) {
            createPostForm.addEventListener('submit', (e) => {
                this.handleCreatePost(e);
            });
        }
    }

    async loadMockData() {
        this.categories = [
            { id: 'eventi', name: 'Eventi', icon: '🎭', count: 45 },
            { id: 'locali', name: 'Locali', icon: '🍸', count: 32 },
            { id: 'musica', name: 'Musica', icon: '🎵', count: 28 },
            { id: 'outfit', name: 'Outfit', icon: '👗', count: 19 },
            { id: 'gossip', name: 'Gossip', icon: '💬', count: 67 },
            { id: 'recensioni', name: 'Recensioni', icon: '⭐', count: 23 },
            { id: 'meetup', name: 'Meetup', icon: '👥', count: 15 },
            { id: 'deals', name: 'Deals', icon: '💰', count: 11 }
        ];

        // Carica i post dal database
        await this.loadPostsFromDatabase();
    }
async loadPostsFromDatabase() {
        try {
            // Usa Netlify Functions invece di chiamate dirette a Supabase
            const response = await fetch('/api/forum-posts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to load posts');
            }

            // Convert database posts to frontend format
            this.posts = data.posts.map(post => ({
                id: post.id,
                title: post.title,
                content: post.content,
                category: post.category,
                tags: post.tags || [],
                images: post.images || [],
                author: {
                    username: post.author_username,
                    avatar: this.getAuthorAvatar(post.author_username),
                    reputation: 0,
                    badge: this.getAuthorBadge(post.author_username)
                },
                timestamp: new Date(post.created_at),
                likes: post.likes || 0,
                comments: post.comments || 0,
                views: post.views || 0,
                isLiked: false,
                isSaved: false
            }));

            console.log('Posts loaded successfully:', this.posts.length);

        } catch (error) {
            console.error('Error loading posts:', error);
            this.posts = [];
            
            // Mostra errore all'utente
            if (window.app && window.app.showToast) {
                window.app.showToast('Errore nel caricamento dei post', 'error');
            }
        }
    }

    getAuthorAvatar(username) {
        const avatars = ['🌟', '💕', '🎧', '👑', '✨', '🎭', '🔥', '💎', '🌙', '⭐'];
        const index = username.length % avatars.length;
        return avatars[index];
    }

    getAuthorBadge(username) {
        if (username.includes('PR') || username.includes('Official')) return 'Verified PR';
        if (username.includes('DJ') || username.includes('Beat')) return 'Music Expert';
        if (username.includes('Queen') || username.includes('King')) return 'Gold Matcher';
        if (username.includes('Review')) return 'Review Master';
        if (username.includes('Fashion') || username.includes('Style')) return 'Style Guru';
        return 'Community Member';
    }
    renderCategories() {
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) return;

        const allCategory = `
            <button class="category-btn active" data-category="all">
                <div class="category-info">
                    <span class="category-icon">🔥</span>
                    <span class="category-name">Tutti</span>
                </div>
                <span class="category-count">${this.posts.length}</span>
            </button>
        `;

        const categoriesHTML = this.categories.map(category => `
            <button class="category-btn" data-category="${category.id}">
                <div class="category-info">
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-name">${category.name}</span>
                </div>
                <span class="category-count">${category.count}</span>
            </button>
        `).join('');

        categoriesContainer.innerHTML = allCategory + categoriesHTML;

        // Re-bind events
        categoriesContainer.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterByCategory(e.currentTarget.dataset.category);
            });
        });
    }

    renderTopContributors() {
        const contributorsContainer = document.getElementById('topContributors');
        if (!contributorsContainer) return;

        const contributors = [
            { username: "PRMilano_Official", avatar: "🎭", reputation: 892, badge: "Verified PR" },
            { username: "ReviewQueen_MI", avatar: "👑", reputation: 678, badge: "Review Master" },
            { username: "DJMarcoBeat", avatar: "🎧", reputation: 445, badge: "Music Expert" },
            { username: "MilanNightQueen", avatar: "🌟", reputation: 234, badge: "Gold Matcher" },
            { username: "FashionLover23", avatar: "✨", reputation: 156, badge: "Style Guru" }
        ];

        contributorsContainer.innerHTML = contributors.map((user, index) => `
            <div class="contributor-item">
                <div class="contributor-rank">#${index + 1}</div>
                <div class="contributor-avatar">${user.avatar}</div>
                <div class="contributor-info">
                    <div class="contributor-username">${user.username}</div>
                    <div class="contributor-reputation">${user.reputation} rep</div>
                    <div class="contributor-badge">${user.badge}</div>
                </div>
            </div>
        `).join('');
    }

    renderPosts() {
        const postsContainer = document.getElementById('postsContainer');
        if (!postsContainer) return;

        let filteredPosts = [...this.posts];

        // Apply category filter
        if (this.currentFilter !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.category === this.currentFilter);
        }

        // Apply sorting
        switch (this.currentSort) {
            case 'recent':
                filteredPosts.sort((a, b) => b.timestamp - a.timestamp);
                break;
            case 'popular':
                filteredPosts.sort((a, b) => b.likes - a.likes);
                break;
            case 'discussed':
                filteredPosts.sort((a, b) => b.comments - a.comments);
                break;
        }

        // Apply pagination
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        if (paginatedPosts.length === 0) {
            postsContainer.innerHTML = `
                <div class="no-posts">
                    <div class="no-posts-icon">🔍</div>
                    <h3>Nessun post trovato</h3>
                    <p>Prova a cambiare filtri o crea il primo post!</p>
                    <button class="btn-primary" onclick="flir2night.showCreatePostModal()">
                        Crea Post
                    </button>
                </div>
            `;
            return;
        }

        const postsHTML = paginatedPosts.map(post => this.renderPostCard(post)).join('');
        postsContainer.innerHTML = postsHTML;
        postsContainer.className = `posts-container ${this.currentView}`;

        // Render pagination
        this.renderPagination(filteredPosts.length);
    }
renderPostCard(post) {
        const timeAgo = this.formatTimeAgo(post.timestamp);
        const isLikedClass = post.isLiked ? 'liked' : '';
        const isSavedClass = post.isSaved ? 'saved' : '';
        const pinnedBadge = post.isPinned ? '<span class="pinned-badge">📌 Fissato</span>' : '';

        const imagesHTML = post.images ? 
            `<div class="post-images">
                ${post.images.map(img => `<img src="${img}" alt="Post image" loading="lazy">`).join('')}
            </div>` : '';

        return `
            <article class="post-card ${this.currentView}" data-post-id="${post.id}">
                ${pinnedBadge}
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar">${post.author.avatar}</div>
                        <div class="author-info">
                            <div class="author-username">${post.author.username}</div>
                            <div class="author-meta">
                                <span class="author-badge">${post.author.badge}</span>
                                <span class="post-time">${timeAgo}</span>
                            </div>
                        </div>
                    </div>
                    <div class="post-category">
                        <span class="category-tag">${this.getCategoryIcon(post.category)} ${this.getCategoryName(post.category)}</span>
                    </div>
                </div>

                <div class="post-content">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-text">${post.content}</p>
                    ${imagesHTML}
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                    </div>
                </div>

                <div class="post-stats">
                    <span class="stat-item">
                        <span class="stat-icon">👁️</span>
                        <span class="stat-number">${post.views}</span>
                    </span>
                    <span class="stat-item">
                        <span class="stat-icon">❤️</span>
                        <span class="stat-number">${post.likes}</span>
                    </span>
                    <span class="stat-item">
                        <span class="stat-icon">💬</span>
                        <span class="stat-number">${post.comments}</span>
                    </span>
                </div>

                <div class="post-actions">
                    <button class="post-action-btn like-btn ${isLikedClass}" onclick="flir2night.toggleLike(${post.id})">
                        <span class="action-icon">❤️</span>
                        <span class="action-text">Like</span>
                    </button>
                    <button class="post-action-btn comment-btn" onclick="flir2night.showComments(${post.id})">
                        <span class="action-icon">💬</span>
                        <span class="action-text">Commenta</span>
                    </button>
                    <button class="post-action-btn share-btn" onclick="flir2night.sharePost(${post.id})">
                        <span class="action-icon">📤</span>
                        <span class="action-text">Condividi</span>
                    </button>
                    <button class="post-action-btn save-btn ${isSavedClass}" onclick="flir2night.toggleSave(${post.id})">
                        <span class="action-icon">🔖</span>
                        <span class="action-text">Salva</span>
                    </button>
                </div>
            </article>
        `;
    }

    renderPagination(totalPosts) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalPosts / this.postsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="flir2night.goToPage(${this.currentPage - 1})">‹ Precedente</button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="pagination-btn active">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `<button class="pagination-btn" onclick="flir2night.goToPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `<span class="pagination-dots">...</span>`;
            }
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="pagination-btn" onclick="flir2night.goToPage(${this.currentPage + 1})">Successiva ›</button>`;
        }

        paginationContainer.innerHTML = `<div class="pagination-wrapper">${paginationHTML}</div>`;
    }

    // Event handlers
    filterByCategory(category) {
        this.currentFilter = category;
        this.currentPage = 1;

        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.renderPosts();
    }

    toggleView(view) {
        this.currentView = view;

        // Update active view button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        this.renderPosts();
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderPosts();
        
        // Scroll to top of posts
        document.getElementById('postsContainer').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    searchPosts(query) {
        if (!query.trim()) {
            this.renderPosts();
            return;
        }

        const filteredPosts = this.posts.filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
            post.author.username.toLowerCase().includes(query.toLowerCase())
        );

        this.renderFilteredPosts(filteredPosts);
    }

    renderFilteredPosts(posts) {
        const postsContainer = document.getElementById('postsContainer');
        if (!postsContainer) return;

        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="no-posts">
                    <div class="no-posts-icon">🔍</div>
                    <h3>Nessun risultato trovato</h3>
                    <p>Prova con parole chiave diverse</p>
                </div>
            `;
            return;
        }

        const postsHTML = posts.map(post => this.renderPostCard(post)).join('');
        postsContainer.innerHTML = postsHTML;
        postsContainer.className = `posts-container ${this.currentView}`;
    }
    // Post interactions
    toggleLike(postId) {
        if (!window.app || !window.app.user) {
            window.app.showToast('Effettua il login per mettere like', 'warning');
            showLoginModal();
            return;
        }

        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;

        // Update UI
        const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
        const likeCount = document.querySelector(`[data-post-id="${postId}"] .stat-item:nth-child(2) .stat-number`);
        
        if (likeBtn) {
            likeBtn.classList.toggle('liked', post.isLiked);
        }
        if (likeCount) {
            likeCount.textContent = post.likes;
        }

        window.app.showToast(post.isLiked ? 'Like aggiunto!' : 'Like rimosso', 'success');
    }

    toggleSave(postId) {
        if (!window.app || !window.app.user) {
            window.app.showToast('Effettua il login per salvare post', 'warning');
            showLoginModal();
            return;
        }

        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        post.isSaved = !post.isSaved;

        // Update UI
        const saveBtn = document.querySelector(`[data-post-id="${postId}"] .save-btn`);
        if (saveBtn) {
            saveBtn.classList.toggle('saved', post.isSaved);
        }

        window.app.showToast(post.isSaved ? 'Post salvato!' : 'Post rimosso dai salvati', 'success');
    }

    sharePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const shareData = {
            title: post.title,
            text: post.content,
            url: `${window.location.href}#post-${postId}`
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback - copy to clipboard
            const shareText = `${post.title}\n\n${post.content}\n\n${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                window.app.showToast('Link copiato negli appunti!', 'success');
            });
        }
    }

    showComments(postId) {
        window.app.showToast('Sezione commenti disponibile prossimamente', 'info');
    }

    showCreatePostModal() {
        if (!window.app || !window.app.user) {
            window.app.showToast('Effettua il login per creare post', 'warning');
            showLoginModal();
            return;
        }

        const modal = document.getElementById('createPostModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideCreatePostModal() {
        const modal = document.getElementById('createPostModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    async handleCreatePost(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '🔄 Caricamento...';
        submitBtn.disabled = true;
        
        try {
            // Per ora, salviamo il post SENZA immagini per evitare problemi CORS
            // Le immagini verranno aggiunte in una versione futura
            const postData = {
                title: formData.get('title'),
                content: formData.get('content'),
                category: formData.get('category'),
                tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
// Handle image uploads prima di creare postData
let imageUrls = [];
const fileInput = form.querySelector('input[type="file"]');

if (fileInput && fileInput.files.length > 0) {
    for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        });
        
        if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            if (uploadData.success) {
                imageUrls.push(uploadData.url);
            }
        }
    }
}

// Poi usa imageUrls invece di array vuoto
images: imageUrls,
                author_id: window.app.user.id,
                author_username: window.app.user.username,
                likes: 0,
                comments: 0,
                views: 0
            };

            // Salva il post via Netlify Functions
            const saveResponse = await fetch('/api/forum-posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (!saveResponse.ok) {
                const errorText = await saveResponse.text();
                throw new Error(`HTTP ${saveResponse.status}: ${errorText}`);
            }

            const saveData = await saveResponse.json();

            if (!saveData.success) {
                throw new Error(saveData.error || 'Unknown error');
            }

            const savedPost = saveData.post;
            
            // Aggiungi il nuovo post alla lista locale
            const newPost = {
                id: savedPost.id,
                title: savedPost.title,
                content: savedPost.content,
                category: savedPost.category,
                tags: savedPost.tags || [],
                images: savedPost.images || [],
                author: {
                    username: savedPost.author_username,
                    avatar: this.getAuthorAvatar(savedPost.author_username),
                    reputation: window.app.user.reputation || 0,
                    badge: this.getAuthorBadge(savedPost.author_username)
                },
                timestamp: new Date(savedPost.created_at),
                likes: 0,
                comments: 0,
                views: 0,
                isLiked: false,
                isSaved: false
            };

            this.posts.unshift(newPost);
            this.renderPosts();
            this.hideCreatePostModal();
            form.reset();
            
            window.app.showToast('Post creato con successo!', 'success');
            
        } catch (error) {
            console.error('Error creating post:', error);
            window.app.showToast(`Errore: ${error.message}`, 'error');
        } finally {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    // Utility methods
    formatTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 60) {
            return `${minutes}m fa`;
        } else if (hours < 24) {
            return `${hours}h fa`;
        } else {
            return `${days}g fa`;
        }
    }

    getCategoryIcon(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.icon : '📝';
    }

    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : 'Generale';
    }
}

// Close create post modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.id === 'createPostModal') {
        window.flir2night.hideCreatePostModal();
    }
});

// Initialize Flir2night forum
document.addEventListener('DOMContentLoaded', () => {
    window.flir2night = new Flir2nightForum();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Flir2nightForum;
}
