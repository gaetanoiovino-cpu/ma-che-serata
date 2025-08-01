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
