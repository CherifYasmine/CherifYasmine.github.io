// ===== PROJECTS PAGE CONTROLLER =====

class ProjectsPageController {
    constructor() {
        // Instantiate dependencies first to avoid undefined references during init
        this.animationObserver = new AnimationObserver();
        this.projectCarouselController = new ProjectCarouselController();
        this.projectModalController = new ProjectModalController();
        this.githubStatsController = new GitHubStatsController();

        // Run initialization after dependencies are ready
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeComponents();
        // Page animations are triggered on window.load via startPageAnimations()
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
        this.animationObserver.observe('.project-card', {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        this.animationObserver.observe('.tech-item', {
            threshold: 0.3,
            rootMargin: '0px 0px -30px 0px'
        });

        this.animationObserver.observe('.github-card', {
            threshold: 0.4
        });
    }

    startPageAnimations() {
        this.animateHeaderElements();
        this.startParticleSystem();
        this.startCodeBlockAnimation();
        this.animateProjectCards();
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
            .from('.header-actions .btn', {
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
            // Random initial position and animation
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

    startCodeBlockAnimation() {
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
                duration: 12,
                repeat: -1,
                delay: index * 4,
                ease: 'none'
            });
        });
    }

    animateProjectCards() {
        const cards = document.querySelectorAll('.project-card');
        
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
                            delay: index * 0.1,
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

    handleResize() {
        this.projectCarouselController.handleResize();
    }
}

// ===== PROJECT CAROUSEL CONTROLLER =====

class ProjectCarouselController {
    constructor() {
        this.carousel = document.querySelector('.showcase-carousel');
        this.slides = document.querySelectorAll('.showcase-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.querySelector('.carousel-btn.prev');
        this.nextBtn = document.querySelector('.carousel-btn.next');
        this.currentSlide = 0;
        this.autoplayInterval = null;
        
        if (this.carousel) {
            this.initialize();
        }
    }

    initialize() {
        this.setupEventListeners();
        this.startAutoplay();
    }

    setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.previousSlide();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }

        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });

        // Pause autoplay on hover
        if (this.carousel) {
            this.carousel.addEventListener('mouseenter', () => {
                this.stopAutoplay();
            });

            this.carousel.addEventListener('mouseleave', () => {
                this.startAutoplay();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.carousel && this.isInViewport(this.carousel)) {
                if (e.key === 'ArrowLeft') {
                    this.previousSlide();
                } else if (e.key === 'ArrowRight') {
                    this.nextSlide();
                }
            }
        });
    }

    nextSlide() {
        this.goToSlide((this.currentSlide + 1) % this.slides.length);
    }

    previousSlide() {
        this.goToSlide(
            this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1
        );
    }

    goToSlide(index) {
        if (index === this.currentSlide) return;
        
        // Remove active classes
        this.slides[this.currentSlide].classList.remove('active');
        this.indicators[this.currentSlide].classList.remove('active');
        
        // Add active classes
        this.currentSlide = index;
        this.slides[this.currentSlide].classList.add('active');
        this.indicators[this.currentSlide].classList.add('active');
        
        // Animate slide transition
        this.animateSlideTransition();
    }

    animateSlideTransition() {
        const activeSlide = this.slides[this.currentSlide];
        const slideContent = activeSlide.querySelector('.slide-content');
        
        gsap.fromTo(slideContent, {
            opacity: 0,
            y: 30
        }, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        });
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, 8000);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    handleResize() {
        // Recalculate positions if needed
        this.animateSlideTransition();
    }
}

// ===== PROJECT MODAL CONTROLLER =====

class ProjectModalController {
    constructor() {
        this.modal = document.getElementById('project-modal');
        this.modalContent = this.modal?.querySelector('#modal-content');
        this.modalTitle = this.modal?.querySelector('#modal-title');
        this.closeButton = this.modal?.querySelector('.modal-close');
        
        if (this.modal) {
            this.initialize();
        }
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close button
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close on backdrop click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Project card action buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="preview"]') || 
                e.target.closest('[data-action="preview"]')) {
                const projectCard = e.target.closest('.project-card');
                this.openProjectModal(projectCard);
            }

            // Open GitHub link if provided on the card
            if (e.target.matches('[data-action="github"]') ||
                e.target.closest('[data-action="github"]')) {
                const projectCard = e.target.closest('.project-card');
                const url = projectCard?.dataset.githubUrl || projectCard?.getAttribute('data-github-url');
                if (url) {
                    window.open(url, '_blank', 'noopener');
                }
            }
        });
    }

    openProjectModal(projectCard) {
        const title = projectCard.querySelector('.project-title').textContent;
        const description = projectCard.querySelector('.project-description').textContent;
        const features = Array.from(projectCard.querySelectorAll('.feature-item span'))
            .map(feature => feature.textContent);
        
        this.modalTitle.textContent = title;
        this.modalContent.innerHTML = this.generateModalContent(description, features);
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Animate modal appearance
        gsap.fromTo(this.modal.querySelector('.modal-content'), {
            scale: 0.9,
            opacity: 0,
            y: 50
        }, {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
        });
    }

    closeModal() {
        gsap.to(this.modal.querySelector('.modal-content'), {
            scale: 0.9,
            opacity: 0,
            y: 50,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                this.modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    generateModalContent(description, features) {
        return `
            <div class="modal-project-details">
                <p>${description}</p>
                
                <h4>Key Features</h4>
                <ul>
                    ${features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                
                <div class="modal-actions">
                    <button class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i>
                        View Live Demo
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fab fa-github"></i>
                        View Source Code
                    </button>
                </div>
            </div>
        `;
    }
}

// ===== GITHUB STATS CONTROLLER =====

class GitHubStatsController {
    constructor() {
        this.statsContainer = document.querySelector('.github-stats');
        this.languageBars = document.querySelectorAll('.progress');
        this.hasAnimated = false;
        
        if (this.statsContainer) {
            this.initialize();
        }
    }

    initialize() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.animateGitHubStats();
                    this.hasAnimated = true;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(this.statsContainer);
    }

    animateGitHubStats() {
        // Animate metric numbers
        const metrics = document.querySelectorAll('.github-metric .metric-number');
        metrics.forEach((metric, index) => {
            const finalValue = metric.textContent.replace(/[^\d]/g, '');
            const numericValue = parseInt(finalValue);
            
            if (!isNaN(numericValue)) {
                gsap.fromTo({ value: 0 }, {
                    value: numericValue,
                    duration: 2,
                    delay: index * 0.2,
                    ease: 'power2.out',
                    onUpdate: function() {
                        const current = Math.round(this.targets()[0].value);
                        metric.textContent = current + (metric.textContent.includes('+') ? '+' : '');
                    }
                });
            }
        });

        // Animate language progress bars
        this.languageBars.forEach((bar, index) => {
            const width = bar.dataset.width;
            gsap.to(bar, {
                width: width,
                duration: 1.5,
                delay: index * 0.2,
                ease: 'power2.out'
            });
        });
    }
}

// ===== PROJECT SEARCH CONTROLLER =====

class ProjectSearchController {
    constructor() {
        this.searchInput = document.getElementById('project-search');
        this.projectCards = document.querySelectorAll('.project-card');
        
        if (this.searchInput) {
            this.initialize();
        }
    }

    initialize() {
        this.setupSearch();
    }

    setupSearch() {
        this.searchInput.addEventListener('input', Utils.debounce((e) => {
            this.performSearch(e.target.value);
        }, 300));
    }

    performSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        this.projectCards.forEach(card => {
            const title = card.querySelector('.project-title').textContent.toLowerCase();
            const description = card.querySelector('.project-description').textContent.toLowerCase();
            const techTags = Array.from(card.querySelectorAll('.tech-tag'))
                .map(tag => tag.textContent.toLowerCase()).join(' ');
            
            const matches = !searchTerm || 
                           title.includes(searchTerm) || 
                           description.includes(searchTerm) ||
                           techTags.includes(searchTerm);
            
            if (matches) {
                gsap.to(card, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                card.style.display = '';
            } else {
                gsap.to(card, {
                    opacity: 0,
                    scale: 0.9,
                    duration: 0.3,
                    ease: 'power2.out',
                    onComplete: () => {
                        card.style.display = 'none';
                    }
                });
            }
        });
    }
}

// ===== PROJECT ANALYTICS =====

class ProjectAnalytics {
    constructor() {
        this.trackingData = {
            projectsViewed: new Set(),
            timeOnPage: 0,
            interactions: 0
        };
        
        this.initialize();
    }

    initialize() {
        this.startTimeTracking();
        this.setupInteractionTracking();
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
            if (e.target.matches('.project-card, .btn-icon')) {
                this.trackingData.interactions++;
                
                if (e.target.matches('.project-card') || e.target.closest('.project-card')) {
                    const projectCard = e.target.matches('.project-card') ? 
                        e.target : e.target.closest('.project-card');
                    const projectTitle = projectCard.querySelector('.project-title')?.textContent;
                    if (projectTitle) {
                        this.trackingData.projectsViewed.add(projectTitle);
                    }
                }
            }
        });
    }

    sendAnalytics() {
        if (window.gtag) {
            window.gtag('event', 'projects_page_interaction', {
                event_category: 'Projects',
                event_label: 'Page Analytics',
                value: this.trackingData.interactions,
                custom_parameters: {
                    time_on_page: this.trackingData.timeOnPage,
                    projects_viewed: this.trackingData.projectsViewed.size
                }
            });
        }
    }
}

// ===== PERFORMANCE MONITOR =====

class ProjectsPerformanceMonitor {
    constructor() {
        this.startTime = performance.now();
        this.setupMonitoring();
    }

    setupMonitoring() {
        window.addEventListener('load', () => {
            this.reportLoadTime();
        });

        // Monitor filter performance
        let lastFilterTime = 0;
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
                const now = performance.now();
                if (lastFilterTime > 0) {
                    const filterDelta = now - lastFilterTime;
                    if (filterDelta < 100) {
                        console.warn('Rapid filter switching detected:', filterDelta);
                    }
                }
                lastFilterTime = now;
            }
        });
    }

    reportLoadTime() {
        const loadTime = performance.now() - this.startTime;
        console.log(`Projects page loaded in ${loadTime.toFixed(2)}ms`);
        
        if (window.gtag) {
            window.gtag('event', 'page_load_time', {
                event_category: 'Performance',
                event_label: 'Projects Page',
                value: Math.round(loadTime)
            });
        }
    }
}

// ===== UTILITY FUNCTIONS =====

class ProjectsPageUtils {
    static formatProjectDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
    }

    static calculateProjectDuration(startDate, endDate = null) {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        
        const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                      (end.getMonth() - start.getMonth());
        
        if (months < 1) {
            return 'Less than 1 month';
        } else if (months === 1) {
            return '1 month';
        } else if (months < 12) {
            return `${months} months`;
        } else {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            return years === 1 ? 
                `1 year${remainingMonths > 0 ? ` ${remainingMonths} months` : ''}` :
                `${years} years${remainingMonths > 0 ? ` ${remainingMonths} months` : ''}`;
        }
    }

    static generateProjectSlug(title) {
        return title.toLowerCase()
                   .replace(/[^a-z0-9]+/g, '-')
                   .replace(/^-|-$/g, '');
    }

    static exportProjectsData() {
        const projectsData = {
            projects: [],
            exportDate: new Date().toISOString()
        };

        document.querySelectorAll('.project-card').forEach(card => {
            projectsData.projects.push({
                title: card.querySelector('.project-title')?.textContent,
                description: card.querySelector('.project-description')?.textContent,
                category: card.querySelector('.project-category')?.textContent,
                status: card.querySelector('.project-status')?.textContent,
                technologies: Array.from(card.querySelectorAll('.tech-tag')).map(tag => tag.textContent),
                features: Array.from(card.querySelectorAll('.feature-item span')).map(feature => feature.textContent)
            });
        });

        return projectsData;
    }

    static shareProject(projectTitle, projectUrl) {
        if (navigator.share) {
            navigator.share({
                title: `Check out: ${projectTitle}`,
                text: `Take a look at this amazing project by Yasmine Cherif`,
                url: projectUrl
            });
        } else {
            // Fallback to copying URL
            navigator.clipboard.writeText(projectUrl).then(() => {
                Utils.showNotification('Project URL copied to clipboard!', 'success');
            });
        }
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    // Initialize main controller
    const projectsController = new ProjectsPageController();
    
    // Initialize additional controllers
    const searchController = new ProjectSearchController();
    const analyticsController = new ProjectAnalytics();
    const performanceMonitor = new ProjectsPerformanceMonitor();
    
    // Set up global references
    window.projectsPageController = projectsController;
    
    // Initialize theme controller if not present
    if (!window.themeController) {
        window.themeController = new ThemeController();
    }
    
    // Add project card hover effects
    document.querySelectorAll('.project-card').forEach(card => {
        const techTags = card.querySelectorAll('.tech-tag');
        
        card.addEventListener('mouseenter', () => {
            gsap.to(techTags, {
                y: -2,
                duration: 0.2,
                stagger: 0.03,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(techTags, {
                y: 0,
                duration: 0.2,
                stagger: 0.03,
                ease: 'power2.out'
            });
        });
    });
    
    // Show success notification
    // Utils.showNotification('Projects page loaded successfully!', 'success');
});

// ===== INTERSECTION OBSERVER ENHANCEMENTS =====

// Enhanced project card animations
const enhancedProjectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const card = entry.target;
            const image = card.querySelector('.project-image');
            const content = card.querySelector('.project-content');
            const techTags = card.querySelectorAll('.tech-tag');
            
            const timeline = gsap.timeline();
            
            timeline
                .from(image, {
                    scale: 1.1,
                    duration: 0.8,
                    ease: 'power2.out'
                })
                .from(content.children, {
                    y: 30,
                    opacity: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out'
                }, '-=0.4')
                .from(techTags, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: 'back.out(1.7)'
                }, '-=0.2');
            
            enhancedProjectObserver.unobserve(card);
        }
    });
}, {
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px'
});

// Apply enhanced animations to featured projects
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelectorAll('.project-card.featured').forEach(card => {
            enhancedProjectObserver.observe(card);
        });
    }, 500);
});