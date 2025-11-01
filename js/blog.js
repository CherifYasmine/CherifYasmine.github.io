// ===== BLOG PAGE CONTROLLER =====

class BlogPageController {
    constructor() {
        this.initialize();
        this.animationObserver = new AnimationObserver();
        this.blogFilterController = new BlogFilterController();
        this.blogSearchController = new BlogSearchController();
        this.newsletterController = new NewsletterController();
        this.blogAnalytics = new BlogAnalytics();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeComponents();
        this.startAnimations();
    }

    setupEventListeners() {
        window.addEventListener('load', () => {
            this.startPageAnimations();
        });

        window.addEventListener('scroll', Utils.throttle(() => {
            this.handleScroll();
        }, 16));

        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));
    }

    initializeComponents() {
        // Initialize intersection observers for animations
        this.animationObserver.observe('.article-card', {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        this.animationObserver.observe('.archive-card', {
            threshold: 0.3,
            rootMargin: '0px 0px -30px 0px'
        });

        this.animationObserver.observe('.newsletter-section', {
            threshold: 0.4
        });
    }

    startPageAnimations() {
        this.animateHeaderElements();
        this.startParticleSystem();
        this.startFloatingCodeAnimation();
        this.animateArticleCards();
    }

    animateHeaderElements() {
        const timeline = gsap.timeline({ delay: 0.5 });
        
        timeline
            .from('.header-badge', {
                scale: 0,
                opacity: 0,
                duration: 0.6,
                ease: 'back.out(1.7)'
            })
            .from('.title-gradient', {
                y: 100,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            }, '-=0.3')
            .from('.title-main', {
                y: 100,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            }, '-=0.8')
            .from('.page-subtitle', {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out'
            }, '-=0.5')
            .from('.stat-item', {
                y: 30,
                opacity: 0,
                scale: 0.9,
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.7)'
            }, '-=0.4')
            .from('.header-actions > *', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.2,
                ease: 'power2.out'
            }, '-=0.3');
    }

    startParticleSystem() {
        const particles = document.querySelectorAll('.particle');
        
        particles.forEach((particle, index) => {
            gsap.set(particle, {
                scale: Math.random() * 0.5 + 0.5,
                opacity: Math.random() * 0.6 + 0.2
            });

            gsap.to(particle, {
                y: -30 - Math.random() * 20,
                x: (Math.random() - 0.5) * 50,
                scale: Math.random() * 0.8 + 0.6,
                duration: 4 + Math.random() * 4,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: index * 0.5
            });
        });
    }

    startFloatingCodeAnimation() {
        const codeBlocks = document.querySelectorAll('.code-block');
        
        codeBlocks.forEach((block, index) => {
            gsap.fromTo(block, {
                x: '-100%',
                opacity: 0,
                rotateY: -45
            }, {
                x: 'calc(100vw + 100px)',
                opacity: 1,
                rotateY: 45,
                duration: 15,
                repeat: -1,
                delay: index * 5,
                ease: 'none'
            });
        });
    }

    animateArticleCards() {
        const cards = document.querySelectorAll('.article-card');
        
        cards.forEach((card, index) => {
            gsap.set(card, {
                y: 50,
                opacity: 0,
                scale: 0.95
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        gsap.to(entry.target, {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.8,
                            delay: (index % 3) * 0.1,
                            ease: 'power3.out'
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            observer.observe(card);
        });
    }

    handleScroll() {
        this.updateParallaxElements();
        this.updateStatNumbers();
        this.updateReadingProgress();
    }

    updateParallaxElements() {
        const scrollY = window.scrollY;
        const headerBackground = document.querySelector('.header-background');
        
        if (headerBackground) {
            const parallaxSpeed = 0.4;
            headerBackground.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
        }
    }

    updateStatNumbers() {
        const stats = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateStatNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => {
            if (!stat.hasAttribute('data-animated')) {
                observer.observe(stat);
            }
        });
    }

    animateStatNumber(element) {
        const finalValue = element.textContent.replace(/[^\d.]/g, '');
        const suffix = element.textContent.replace(/[\d.]/g, '');
        const numericValue = parseFloat(finalValue);
        
        if (!isNaN(numericValue)) {
            element.setAttribute('data-animated', 'true');
            
            gsap.fromTo({ value: 0 }, {
                value: numericValue,
                duration: 2,
                ease: 'power2.out',
                onUpdate: function() {
                    const current = this.targets()[0].value;
                    const displayValue = Math.round(current);
                    element.textContent = displayValue + suffix;
                }
            });
        }
    }

    updateReadingProgress() {
        // Add reading progress indicator for blog posts
        const articles = document.querySelectorAll('.article-card');
        articles.forEach(article => {
            const rect = article.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                article.classList.add('in-viewport');
            }
        });
    }

    handleResize() {
        // Handle any resize-specific logic
        this.animateArticleCards();
    }
}

// ===== BLOG FILTER CONTROLLER =====

class BlogFilterController {
    constructor() {
        this.filterButtons = document.querySelectorAll('.category-filter');
        this.articleCards = document.querySelectorAll('.article-card');
        this.activeFilter = 'all';
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFilterClick(button);
            });
        });
    }

    handleFilterClick(button) {
        const category = button.dataset.category;
        
        // Update active button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter articles
        this.filterArticles(category);
        this.activeFilter = category;
        
        // Update URL without page reload
        this.updateURL(category);
        
        // Analytics
        if (window.gtag) {
            window.gtag('event', 'blog_filter', {
                event_category: 'Blog',
                event_label: category
            });
        }
    }

    filterArticles(category) {
        this.articleCards.forEach((card, index) => {
            const cardCategory = card.dataset.category;
            const shouldShow = category === 'all' || cardCategory === category;
            
            if (shouldShow) {
                card.classList.remove('hidden');
                gsap.to(card, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.6,
                    delay: index * 0.05,
                    ease: 'power2.out'
                });
            } else {
                gsap.to(card, {
                    opacity: 0,
                    scale: 0.9,
                    y: -20,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        card.classList.add('hidden');
                    }
                });
            }
        });
    }

    updateURL(category) {
        const url = new URL(window.location);
        if (category === 'all') {
            url.searchParams.delete('category');
        } else {
            url.searchParams.set('category', category);
        }
        window.history.replaceState({}, '', url);
    }

    getVisibleArticles() {
        return Array.from(this.articleCards).filter(card => 
            !card.classList.contains('hidden')
        );
    }
}

// ===== BLOG SEARCH CONTROLLER =====

class BlogSearchController {
    constructor() {
        this.searchInput = document.getElementById('blog-search');
        this.articleCards = document.querySelectorAll('.article-card');
        this.searchResults = [];
        
        if (this.searchInput) {
            this.initialize();
        }
    }

    initialize() {
        this.setupSearch();
        this.setupKeyboardShortcuts();
    }

    setupSearch() {
        this.searchInput.addEventListener('input', Utils.debounce((e) => {
            this.performSearch(e.target.value);
        }, 300));

        this.searchInput.addEventListener('focus', () => {
            this.searchInput.parentElement.classList.add('focused');
        });

        this.searchInput.addEventListener('blur', () => {
            this.searchInput.parentElement.classList.remove('focused');
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.searchInput.focus();
            }
            
            // Escape to clear search
            if (e.key === 'Escape' && document.activeElement === this.searchInput) {
                this.clearSearch();
            }
        });
    }

    performSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.clearSearch();
            return;
        }

        this.searchResults = [];
        
        this.articleCards.forEach((card, index) => {
            const title = card.querySelector('.article-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.article-excerpt').textContent.toLowerCase();
            const category = card.querySelector('.article-category').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.tag'))
                .map(tag => tag.textContent.toLowerCase()).join(' ');
            
            const searchContent = `${title} ${excerpt} ${category} ${tags}`;
            const matches = searchContent.includes(searchTerm);
            
            if (matches) {
                this.searchResults.push({
                    element: card,
                    score: this.calculateRelevanceScore(searchTerm, title, excerpt, category, tags)
                });
            }
            
            this.animateSearchResult(card, matches, index);
        });
        
        // Sort by relevance
        this.searchResults.sort((a, b) => b.score - a.score);
        
        // Update search results counter
        this.updateSearchCounter(searchTerm);
        
        // Analytics
        if (window.gtag) {
            window.gtag('event', 'blog_search', {
                event_category: 'Blog',
                event_label: searchTerm,
                value: this.searchResults.length
            });
        }
    }

    calculateRelevanceScore(searchTerm, title, excerpt, category, tags) {
        let score = 0;
        
        // Title matches are most important
        if (title.includes(searchTerm)) score += 10;
        
        // Category matches are moderately important
        if (category.includes(searchTerm)) score += 5;
        
        // Tag matches are important
        if (tags.includes(searchTerm)) score += 7;
        
        // Content matches are least important but still relevant
        if (excerpt.includes(searchTerm)) score += 3;
        
        // Boost score for exact word matches
        const words = searchTerm.split(' ');
        words.forEach(word => {
            if (title.includes(word)) score += 2;
            if (category === word) score += 3;
        });
        
        return score;
    }

    animateSearchResult(card, matches, index) {
        if (matches) {
            card.classList.remove('search-hidden');
            gsap.to(card, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.4,
                delay: index * 0.03,
                ease: 'power2.out'
            });
        } else {
            gsap.to(card, {
                opacity: 0.3,
                scale: 0.95,
                y: -10,
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => {
                    card.classList.add('search-hidden');
                }
            });
        }
    }

    clearSearch() {
        this.searchInput.value = '';
        this.searchResults = [];
        
        this.articleCards.forEach((card, index) => {
            card.classList.remove('search-hidden');
            gsap.to(card, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.4,
                delay: index * 0.03,
                ease: 'power2.out'
            });
        });
        
        this.updateSearchCounter('');
    }

    updateSearchCounter(searchTerm) {
        // Create or update search counter display
        let counter = document.querySelector('.search-counter');
        
        if (!counter && searchTerm) {
            counter = document.createElement('div');
            counter.className = 'search-counter';
            this.searchInput.parentElement.appendChild(counter);
        }
        
        if (counter) {
            if (searchTerm) {
                const count = this.searchResults.length;
                counter.textContent = `${count} article${count !== 1 ? 's' : ''} found`;
                counter.style.display = 'block';
            } else {
                counter.style.display = 'none';
            }
        }
    }
}

// ===== NEWSLETTER CONTROLLER =====

class NewsletterController {
    constructor() {
        this.newsletterForm = document.getElementById('newsletter-form');
        this.newsletterBtns = document.querySelectorAll('.newsletter-btn');
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.newsletterForm) {
            this.newsletterForm.addEventListener('submit', (e) => {
                this.handleNewsletterSubmit(e);
            });
        }

        this.newsletterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.scrollToNewsletter();
            });
        });
    }

    handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
        
        if (!this.validateEmail(email)) {
            Utils.showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        this.submitNewsletter(email);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async submitNewsletter(email) {
        const submitButton = this.newsletterForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Update button state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        submitButton.disabled = true;
        
        try {
            // Simulate API call (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            Utils.showNotification('Successfully subscribed to newsletter!', 'success');
            this.newsletterForm.reset();
            
            // Analytics
            if (window.gtag) {
                window.gtag('event', 'newsletter_signup', {
                    event_category: 'Engagement',
                    event_label: 'Blog Newsletter'
                });
            }
            
        } catch (error) {
            Utils.showNotification('Failed to subscribe. Please try again later.', 'error');
        } finally {
            // Reset button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }

    scrollToNewsletter() {
        const newsletterSection = document.querySelector('.newsletter-section');
        if (newsletterSection) {
            newsletterSection.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Focus on email input after scroll
            setTimeout(() => {
                const emailInput = newsletterSection.querySelector('input[type="email"]');
                if (emailInput) {
                    emailInput.focus();
                }
            }, 800);
        }
    }
}

// ===== LOAD MORE CONTROLLER =====

class LoadMoreController {
    constructor() {
        this.loadMoreBtn = document.querySelector('.load-more-btn');
        this.articlesGrid = document.querySelector('.articles-grid');
        this.loadedArticles = 6; // Initial articles shown
        this.articlesPerLoad = 3;
        
        if (this.loadMoreBtn) {
            this.initialize();
        }
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.loadMoreBtn.addEventListener('click', () => {
            this.loadMoreArticles();
        });
    }

    async loadMoreArticles() {
        const originalText = this.loadMoreBtn.innerHTML;
        
        // Update button state
        this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        this.loadMoreBtn.disabled = true;
        
        try {
            // Simulate loading (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate placeholder articles (replace with real data)
            const newArticles = this.generatePlaceholderArticles();
            
            // Add new articles to grid
            newArticles.forEach((articleHTML, index) => {
                const articleElement = this.createArticleElement(articleHTML);
                this.articlesGrid.appendChild(articleElement);
                
                // Animate in
                gsap.fromTo(articleElement, {
                    opacity: 0,
                    y: 30,
                    scale: 0.9
                }, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: 'power2.out'
                });
            });
            
            this.loadedArticles += this.articlesPerLoad;
            
            // Hide load more button if no more articles
            if (this.loadedArticles >= 25) { // Assuming max 25 articles
                this.loadMoreBtn.style.display = 'none';
            }
            
        } catch (error) {
            Utils.showNotification('Failed to load more articles. Please try again.', 'error');
        } finally {
            // Reset button state
            this.loadMoreBtn.innerHTML = originalText;
            this.loadMoreBtn.disabled = false;
        }
    }

    generatePlaceholderArticles() {
        return [
            {
                title: 'GraphQL vs REST: Choosing the Right API Strategy',
                excerpt: 'Compare GraphQL and REST APIs to determine the best approach for your next project.',
                category: 'backend',
                date: 'February 8, 2024',
                tags: ['GraphQL', 'REST', 'API'],
                views: '1.2K',
                likes: '89'
            },
            {
                title: 'Modern CSS Grid Techniques for Complex Layouts',
                excerpt: 'Master advanced CSS Grid features to create sophisticated and responsive layouts.',
                category: 'frontend',
                date: 'February 5, 2024',
                tags: ['CSS', 'Grid', 'Layout'],
                views: '1.6K',
                likes: '123'
            },
            {
                title: 'Kubernetes Security Best Practices',
                excerpt: 'Essential security practices for protecting your Kubernetes clusters in production.',
                category: 'cloud',
                date: 'February 1, 2024',
                tags: ['Kubernetes', 'Security', 'DevOps'],
                views: '998',
                likes: '76'
            }
        ];
    }

    createArticleElement(articleData) {
        const article = document.createElement('article');
        article.className = 'article-card';
        article.dataset.category = articleData.category;
        
        article.innerHTML = `
            <div class="article-image">
                <img src="../assets/blog/placeholder-${articleData.category}.jpg" alt="${articleData.title}" loading="lazy">
                <div class="article-category">${articleData.category.charAt(0).toUpperCase() + articleData.category.slice(1)}</div>
                <div class="reading-time">
                    <i class="fas fa-clock"></i>
                    ${Math.floor(Math.random() * 10) + 5} min
                </div>
            </div>
            
            <div class="article-content">
                <div class="article-meta">
                    <span class="article-date">${articleData.date}</span>
                    <div class="article-tags">
                        ${articleData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                
                <h3 class="article-title">${articleData.title}</h3>
                
                <p class="article-excerpt">${articleData.excerpt}</p>
                
                <div class="article-stats">
                    <div class="stat">
                        <i class="fas fa-eye"></i>
                        ${articleData.views}
                    </div>
                    <div class="stat">
                        <i class="fas fa-heart"></i>
                        ${articleData.likes}
                    </div>
                </div>
            </div>
        `;
        
        return article;
    }
}

// ===== BLOG ANALYTICS =====

class BlogAnalytics {
    constructor() {
        this.trackingData = {
            articlesViewed: new Set(),
            categoriesViewed: new Set(),
            searchQueries: [],
            timeOnPage: 0,
            interactions: 0,
            scrollDepth: 0
        };
        
        this.initialize();
    }

    initialize() {
        this.startTimeTracking();
        this.setupInteractionTracking();
        this.setupScrollTracking();
    }

    startTimeTracking() {
        this.startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            this.trackingData.timeOnPage = Date.now() - this.startTime;
            this.sendAnalytics();
        });
    }

    setupInteractionTracking() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.article-card, .category-filter, .newsletter-btn')) {
                this.trackingData.interactions++;
                
                if (e.target.matches('.article-card') || e.target.closest('.article-card')) {
                    const articleCard = e.target.matches('.article-card') ? 
                        e.target : e.target.closest('.article-card');
                    const articleTitle = articleCard.querySelector('.article-title')?.textContent;
                    const articleCategory = articleCard.dataset.category;
                    
                    if (articleTitle) {
                        this.trackingData.articlesViewed.add(articleTitle);
                    }
                    if (articleCategory) {
                        this.trackingData.categoriesViewed.add(articleCategory);
                    }
                }
            }
        });
    }

    setupScrollTracking() {
        window.addEventListener('scroll', Utils.throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > this.trackingData.scrollDepth) {
                this.trackingData.scrollDepth = scrollPercent;
            }
        }, 250));
    }

    trackSearch(query, resultsCount) {
        this.trackingData.searchQueries.push({
            query,
            resultsCount,
            timestamp: Date.now()
        });
    }

    sendAnalytics() {
        if (window.gtag) {
            window.gtag('event', 'blog_page_analytics', {
                event_category: 'Blog',
                event_label: 'Page Analytics',
                value: this.trackingData.interactions,
                custom_parameters: {
                    time_on_page: this.trackingData.timeOnPage,
                    articles_viewed: this.trackingData.articlesViewed.size,
                    categories_viewed: this.trackingData.categoriesViewed.size,
                    search_queries: this.trackingData.searchQueries.length,
                    scroll_depth: this.trackingData.scrollDepth
                }
            });
        }
    }
}

// ===== ARTICLE SHARING =====

class ArticleSharingController {
    constructor() {
        this.setupSharingButtons();
    }

    setupSharingButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="share"]') || 
                e.target.closest('[data-action="share"]')) {
                e.preventDefault();
                const articleCard = e.target.closest('.article-card, .featured-post');
                this.shareArticle(articleCard);
            }
            
            if (e.target.matches('[data-action="bookmark"]') || 
                e.target.closest('[data-action="bookmark"]')) {
                e.preventDefault();
                const articleCard = e.target.closest('.article-card, .featured-post');
                this.bookmarkArticle(articleCard);
            }
        });
    }

    shareArticle(articleCard) {
        const title = articleCard.querySelector('.article-title, .post-title').textContent;
        const excerpt = articleCard.querySelector('.article-excerpt, .post-excerpt').textContent;
        const currentUrl = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: title,
                text: excerpt,
                url: currentUrl
            });
        } else {
            // Fallback sharing options
            this.showShareModal(title, excerpt, currentUrl);
        }
    }

    bookmarkArticle(articleCard) {
        const title = articleCard.querySelector('.article-title, .post-title').textContent;
        const bookmarkBtn = articleCard.querySelector('[data-action="bookmark"]');
        
        // Toggle bookmark state
        const isBookmarked = bookmarkBtn.classList.contains('bookmarked');
        
        if (isBookmarked) {
            bookmarkBtn.classList.remove('bookmarked');
            bookmarkBtn.querySelector('i').className = 'fas fa-bookmark';
            Utils.showNotification('Article removed from bookmarks', 'info');
        } else {
            bookmarkBtn.classList.add('bookmarked');
            bookmarkBtn.querySelector('i').className = 'fas fa-bookmark';
            Utils.showNotification('Article bookmarked!', 'success');
        }
        
        // Store in localStorage
        this.updateBookmarks(title, !isBookmarked);
        
        // Analytics
        if (window.gtag) {
            window.gtag('event', 'article_bookmark', {
                event_category: 'Engagement',
                event_label: title,
                value: isBookmarked ? 0 : 1
            });
        }
    }

    updateBookmarks(title, add) {
        let bookmarks = JSON.parse(localStorage.getItem('blog-bookmarks') || '[]');
        
        if (add) {
            if (!bookmarks.includes(title)) {
                bookmarks.push(title);
            }
        } else {
            bookmarks = bookmarks.filter(bookmark => bookmark !== title);
        }
        
        localStorage.setItem('blog-bookmarks', JSON.stringify(bookmarks));
    }

    showShareModal(title, excerpt, url) {
        // Create and show a custom share modal
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-modal-content">
                <h3>Share Article</h3>
                <div class="share-options">
                    <button class="share-btn" onclick="window.open('https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}', '_blank')">
                        <i class="fab fa-twitter"></i> Twitter
                    </button>
                    <button class="share-btn" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}', '_blank')">
                        <i class="fab fa-facebook"></i> Facebook
                    </button>
                    <button class="share-btn" onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}', '_blank')">
                        <i class="fab fa-linkedin"></i> LinkedIn
                    </button>
                    <button class="share-btn" onclick="navigator.clipboard.writeText('${url}'); this.innerHTML='<i class=\\"fas fa-check\\"></i> Copied!'">
                        <i class="fas fa-link"></i> Copy Link
                    </button>
                </div>
                <button class="close-modal" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Remove modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    // Initialize main controller
    const blogController = new BlogPageController();
    
    // Initialize additional controllers
    const loadMoreController = new LoadMoreController();
    const sharingController = new ArticleSharingController();
    
    // Set up global references
    window.blogPageController = blogController;
    
    // Initialize theme controller if not present
    if (!window.themeController) {
        window.themeController = new ThemeController();
    }
    
    // Load bookmarked articles
    const bookmarks = JSON.parse(localStorage.getItem('blog-bookmarks') || '[]');
    document.querySelectorAll('.article-card, .featured-post').forEach(card => {
        const title = card.querySelector('.article-title, .post-title').textContent;
        const bookmarkBtn = card.querySelector('[data-action="bookmark"]');
        
        if (bookmarkBtn && bookmarks.includes(title)) {
            bookmarkBtn.classList.add('bookmarked');
        }
    });
    
    // Handle URL parameters for initial filtering
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category');
    
    if (initialCategory) {
        const categoryBtn = document.querySelector(`[data-category="${initialCategory}"]`);
        if (categoryBtn) {
            categoryBtn.click();
        }
    }
    
    // Show success notification
    // Utils.showNotification('Blog loaded successfully!', 'success');
});

// ===== READING TIME CALCULATOR =====

class ReadingTimeCalculator {
    static calculateReadingTime(text) {
        const wordsPerMinute = 200; // Average reading speed
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        
        return minutes;
    }

    static updateReadingTimes() {
        document.querySelectorAll('.article-card, .featured-post').forEach(card => {
            const excerpt = card.querySelector('.article-excerpt, .post-excerpt');
            const readingTimeElement = card.querySelector('.reading-time');
            
            if (excerpt && readingTimeElement) {
                // Estimate based on excerpt (multiply by factor for full article)
                const excerptWords = excerpt.textContent.trim().split(/\s+/).length;
                const estimatedWords = excerptWords * 10; // Assume excerpt is 1/10th of article
                const readingTime = Math.max(5, Math.ceil(estimatedWords / 200));
                
                readingTimeElement.innerHTML = `
                    <i class="fas fa-clock"></i>
                    ${readingTime} min
                `;
            }
        });
    }
}

// Initialize reading time calculation
document.addEventListener('DOMContentLoaded', () => {
    ReadingTimeCalculator.updateReadingTimes();
});