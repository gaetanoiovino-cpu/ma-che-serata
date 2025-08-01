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
