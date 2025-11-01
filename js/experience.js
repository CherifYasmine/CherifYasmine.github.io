// ===== EXPERIENCE PAGE CONTROLLER =====

class ExperiencePageController {
    constructor() {
        // Initialize dependencies first to avoid undefined references in early events
        this.animationObserver = new AnimationObserver();
        this.timelineController = new TimelineController();
        this.statisticsController = new StatisticsController();
        this.skillsTimelineController = new SkillsTimelineController();
        // Then wire up listeners and page behaviors
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeComponents();
        // startPageAnimations runs on window 'load' via setupEventListeners
    }

    setupEventListeners() {
        // Page load animations
        window.addEventListener('load', () => {
            this.startPageAnimations();
        });

        // Scroll-based animations
        window.addEventListener('scroll', Utils.throttle(() => {
            this.handleScroll();
        }, 16));

        // Resize handler
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));
    }

    initializeComponents() {
        this.animationObserver.observe('.timeline-item', {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        this.animationObserver.observe('.achievement-card', {
            threshold: 0.3
        });

        this.animationObserver.observe('.skill-year', {
            threshold: 0.4
        });
    }

    startPageAnimations() {
        // Animate header elements
        this.animateHeaderElements();
        
        // Start floating code animation
        this.startFloatingCodeAnimation();
        
        // Initialize statistics counting
        this.statisticsController.startCounting();
    }

    animateHeaderElements() {
        const timeline = gsap.timeline({ delay: 0.5 });
        
        timeline
            .from('.page-title', {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            })
            .from('.page-subtitle', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out'
            }, '-=0.5')
            .from('.experience-stats .stat-item', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out'
            }, '-=0.4');
    }

    startFloatingCodeAnimation() {
        const codeSnippets = document.querySelectorAll('.code-snippet');
        
        codeSnippets.forEach((snippet, index) => {
            gsap.fromTo(snippet, {
                y: 100,
                opacity: 0,
                rotation: Math.random() * 10 - 5
            }, {
                y: -50,
                opacity: 0.6,
                rotation: Math.random() * 10 - 5,
                duration: 15 + Math.random() * 5,
                repeat: -1,
                delay: index * 5,
                ease: 'none'
            });
        });
    }

    handleScroll() {
        // Guard in case construction order or async timing triggers scroll early
        if (this.timelineController && typeof this.timelineController.updateProgress === 'function') {
            this.timelineController.updateProgress();
        }
        this.updateParallaxElements();
    }

    updateParallaxElements() {
        const scrollY = window.scrollY;
        const headerBackground = document.querySelector('.header-background');
        
        if (headerBackground) {
            const parallaxSpeed = 0.5;
            headerBackground.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
        }
    }

    handleResize() {
        if (this.timelineController && typeof this.timelineController.recalculatePositions === 'function') {
            this.timelineController.recalculatePositions();
        }
    }
}

// ===== TIMELINE CONTROLLER =====

class TimelineController {
    constructor() {
        this.timelineItems = document.querySelectorAll('.timeline-item');
        this.timelineLine = document.querySelector('.timeline-container::before');
        this.currentProgress = 0;
        this.initialize();
    }

    initialize() {
        this.setupTimelineAnimations();
        this.addHoverEffects();
    }

    setupTimelineAnimations() {
        this.timelineItems.forEach((item, index) => {
            // Set up scroll-triggered animations
            gsap.set(item, {
                opacity: 0,
                y: 50,
                scale: 0.95
            });

            // Create intersection observer for each item
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateTimelineItem(entry.target, index);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            });

            observer.observe(item);
        });
    }

    animateTimelineItem(item, index) {
        const timeline = gsap.timeline();
        
        // Animate the main container
        timeline.to(item, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out'
        });

        // Animate internal elements
        const content = item.querySelector('.timeline-content');
        const achievements = item.querySelectorAll('.achievement-card');
        const techItems = item.querySelectorAll('.tech-item');
        
        if (content) {
            timeline.from(content, {
                x: 50,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out'
            }, '-=0.4');
        }

        if (achievements.length > 0) {
            timeline.from(achievements, {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out'
            }, '-=0.3');
        }

        if (techItems.length > 0) {
            timeline.from(techItems, {
                scale: 0,
                opacity: 0,
                duration: 0.4,
                stagger: 0.05,
                ease: 'back.out(1.7)'
            }, '-=0.2');
        }

        // Add marker animation
        const marker = item.querySelector('.timeline-marker');
        if (marker) {
            timeline.from(marker, {
                scale: 0,
                duration: 0.5,
                ease: 'back.out(1.7)'
            }, '-=0.6');
        }
    }

    addHoverEffects() {
        this.timelineItems.forEach(item => {
            const content = item.querySelector('.timeline-content');
            
            if (content) {
                content.addEventListener('mouseenter', () => {
                    gsap.to(content, {
                        y: -10,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                });

                content.addEventListener('mouseleave', () => {
                    gsap.to(content, {
                        y: 0,
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                });
            }
        });
    }

    updateProgress() {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        this.currentProgress = Math.min(
            (scrollTop + windowHeight / 2) / documentHeight,
            1
        );
        
        this.updateTimelineProgress();
    }

    updateTimelineProgress() {
        // Update timeline line progression
        const timelineContainer = document.querySelector('.timeline-container');
        if (timelineContainer) {
            const containerRect = timelineContainer.getBoundingClientRect();
            const scrollProgress = Math.max(0, Math.min(1, 
                (window.innerHeight - containerRect.top) / containerRect.height
            ));
            
            // Update CSS custom property for timeline progress
            document.documentElement.style.setProperty(
                '--timeline-progress', 
                `${scrollProgress * 100}%`
            );
        }
    }

    recalculatePositions() {
        // Recalculate positions after window resize
        this.timelineItems.forEach(item => {
            gsap.set(item, { clearProps: "transform" });
        });
    }
}

// ===== STATISTICS CONTROLLER =====

class StatisticsController {
    constructor() {
        this.statElements = document.querySelectorAll('.stat-number, .metric-value');
        this.hasAnimated = false;
    }

    startCounting() {
        if (this.hasAnimated) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.animateStatistics();
                    this.hasAnimated = true;
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });

        const statsSection = document.querySelector('.experience-stats');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    animateStatistics() {
        this.statElements.forEach(element => {
            const finalValue = element.textContent.replace(/[^\d.]/g, '');
            const isDecimal = finalValue.includes('.');
            const numericValue = parseFloat(finalValue);
            
            if (!isNaN(numericValue)) {
                this.countUp(element, numericValue, isDecimal);
            }
        });
    }

    countUp(element, target, isDecimal = false) {
        const originalText = element.textContent;
        const suffix = originalText.replace(/[\d.]/g, '');
        
        gsap.fromTo({ value: 0 }, {
            value: target,
            duration: 2,
            ease: 'none',
            onUpdate: function() {
                const current = this.targets()[0].value;
                const displayValue = isDecimal ? 
                    current.toFixed(1) : 
                    Math.round(current);
                element.textContent = displayValue + suffix;
            }
        });
    }
}

// ===== SKILLS TIMELINE CONTROLLER =====

class SkillsTimelineController {
    constructor() {
        this.skillYears = document.querySelectorAll('.skill-year');
        this.initialize();
    }

    initialize() {
        this.setupSkillsAnimations();
        this.addInteractiveEffects();
    }

    setupSkillsAnimations() {
        this.skillYears.forEach((yearElement, index) => {
            gsap.set(yearElement, {
                opacity: 0,
                x: index % 2 === 0 ? -50 : 50,
                scale: 0.9
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateSkillYear(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.3,
                rootMargin: '0px 0px -50px 0px'
            });

            observer.observe(yearElement);
        });
    }

    animateSkillYear(yearElement) {
        const timeline = gsap.timeline();
        
        // Animate container
        timeline.to(yearElement, {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out'
        });

        // Animate skill tags
        const skillTags = yearElement.querySelectorAll('.skill-tag');
        if (skillTags.length > 0) {
            timeline.from(skillTags, {
                scale: 0,
                opacity: 0,
                rotation: 180,
                duration: 0.5,
                stagger: 0.05,
                ease: 'back.out(1.7)'
            }, '-=0.4');
        }
    }

    addInteractiveEffects() {
        this.skillYears.forEach(yearElement => {
            const skillTags = yearElement.querySelectorAll('.skill-tag');
            
            skillTags.forEach(tag => {
                tag.addEventListener('mouseenter', () => {
                    gsap.to(tag, {
                        scale: 1.1,
                        y: -3,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                });

                tag.addEventListener('mouseleave', () => {
                    gsap.to(tag, {
                        scale: 1,
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                });
            });
        });
    }
}

// ===== TECH STACK CONTROLLER =====

class TechStackController {
    constructor() {
        this.techItems = document.querySelectorAll('.tech-item');
        this.setupInteractions();
    }

    setupInteractions() {
        this.techItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.highlightRelatedTech(item);
            });

            item.addEventListener('mouseleave', () => {
                this.resetTechHighlights();
            });
        });
    }

    highlightRelatedTech(activeItem) {
        const category = Array.from(activeItem.classList).find(cls => 
            ['frontend', 'backend', 'database', 'cloud', 'devops', 'mobile', 'testing', 'design', 'desktop'].includes(cls)
        );

        this.techItems.forEach(item => {
            if (item === activeItem) {
                gsap.to(item, {
                    scale: 1.1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else if (item.classList.contains(category)) {
                gsap.to(item, {
                    scale: 1.05,
                    opacity: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else {
                gsap.to(item, {
                    scale: 0.95,
                    opacity: 0.6,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });
    }

    resetTechHighlights() {
        this.techItems.forEach(item => {
            gsap.to(item, {
                scale: 1,
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    }
}

// ===== ACHIEVEMENT CARDS CONTROLLER =====

class AchievementCardsController {
    constructor() {
        this.cards = document.querySelectorAll('.achievement-card');
        this.setupCardAnimations();
    }

    setupCardAnimations() {
        this.cards.forEach((card, index) => {
            // Hover animations
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    y: -5,
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.15)',
                    duration: 0.3,
                    ease: 'power2.out'
                });

                // Animate icon
                const icon = card.querySelector('.achievement-icon');
                if (icon) {
                    gsap.to(icon, {
                        rotation: 5,
                        scale: 1.1,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    y: 0,
                    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
                    duration: 0.3,
                    ease: 'power2.out'
                });

                const icon = card.querySelector('.achievement-icon');
                if (icon) {
                    gsap.to(icon, {
                        rotation: 0,
                        scale: 1,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });
        });
    }
}

// ===== UTILITY FUNCTIONS =====

class ExperiencePageUtils {
    static formatDuration(startDate, endDate = null) {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        
        const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                      (end.getMonth() - start.getMonth());
        
        if (months < 12) {
            return `${months} month${months !== 1 ? 's' : ''}`;
        } else {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            
            let result = `${years} year${years !== 1 ? 's' : ''}`;
            if (remainingMonths > 0) {
                result += ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
            }
            
            return result;
        }
    }

    static highlightSearchTerm(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    static createProgressBar(progress, className = 'progress-bar') {
        const progressBar = document.createElement('div');
        progressBar.className = className;
        progressBar.innerHTML = `
            <div class="progress-fill" style="width: ${progress}%"></div>
        `;
        return progressBar;
    }
}

// ===== SEARCH AND FILTER FUNCTIONALITY =====

class ExperienceSearchController {
    constructor() {
        this.searchInput = document.getElementById('experience-search');
        this.filterButtons = document.querySelectorAll('.filter-button');
        this.timelineItems = document.querySelectorAll('.timeline-item');
        
        if (this.searchInput) {
            this.setupSearch();
        }
        
        this.setupFilters();
    }

    setupSearch() {
        this.searchInput.addEventListener('input', Utils.debounce((e) => {
            this.performSearch(e.target.value);
        }, 300));
    }

    setupFilters() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleFilterClick(button);
            });
        });
    }

    performSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        this.timelineItems.forEach(item => {
            const content = item.textContent.toLowerCase();
            const matches = !searchTerm || content.includes(searchTerm);
            
            if (matches) {
                item.style.display = '';
                gsap.to(item, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else {
                gsap.to(item, {
                    opacity: 0,
                    scale: 0.9,
                    duration: 0.3,
                    ease: 'power2.out',
                    onComplete: () => {
                        item.style.display = 'none';
                    }
                });
            }
        });
    }

    handleFilterClick(button) {
        // Remove active class from all buttons
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        const filter = button.dataset.filter;
        this.applyFilter(filter);
    }

    applyFilter(filter) {
        this.timelineItems.forEach(item => {
            const shouldShow = filter === 'all' || item.dataset.category === filter;
            
            if (shouldShow) {
                item.style.display = '';
                gsap.to(item, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            } else {
                gsap.to(item, {
                    opacity: 0,
                    y: -20,
                    duration: 0.3,
                    ease: 'power2.out',
                    onComplete: () => {
                        item.style.display = 'none';
                    }
                });
            }
        });
    }
}

// ===== PRINT FUNCTIONALITY =====

class ExperiencePrintController {
    constructor() {
        this.setupPrintStyles();
    }

    setupPrintStyles() {
        const printButton = document.getElementById('print-experience');
        
        if (printButton) {
            printButton.addEventListener('click', () => {
                this.printExperience();
            });
        }
    }

    printExperience() {
        // Create print-friendly version
        const printContent = this.generatePrintContent();
        
        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }

    generatePrintContent() {
        const title = document.querySelector('.page-title')?.textContent || 'Experience';
        const content = document.querySelector('.experience-timeline')?.innerHTML || '';
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .timeline-item { margin-bottom: 30px; page-break-inside: avoid; }
                    .timeline-content { border: 1px solid #ccc; padding: 20px; }
                    .achievement-card { display: none; }
                    @page { margin: 1in; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                ${content}
            </body>
            </html>
        `;
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    // Initialize main controller
    const experienceController = new ExperiencePageController();
    
    // Initialize additional controllers
    const techStackController = new TechStackController();
    const achievementCardsController = new AchievementCardsController();
    const searchController = new ExperienceSearchController();
    const printController = new ExperiencePrintController();
    
    // Set up global event listeners
    window.experiencePageController = experienceController;
    
    // Initialize theme controller if not already present
    if (!window.themeController) {
        window.themeController = new ThemeController();
    }
    
    // Show success message
    // Utils.showNotification('Experience page loaded successfully!', 'success');
});

// ===== PERFORMANCE MONITORING =====

class ExperiencePerformanceMonitor {
    constructor() {
        this.startTime = performance.now();
        this._lastWarn = 0;
        this._warnInterval = 2000; // ms between warnings
        this.setupMonitoring();
    }

    setupMonitoring() {
        window.addEventListener('load', () => {
            this.reportLoadTime();
        });

        // Monitor scroll performance
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.checkScrollPerformance();
            }, 100);
        });
    }

    reportLoadTime() {
        const loadTime = performance.now() - this.startTime;
        console.log(`Experience page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Report to analytics if available
        if (window.gtag) {
            window.gtag('event', 'page_load_time', {
                event_category: 'Performance',
                event_label: 'Experience Page',
                value: Math.round(loadTime)
            });
        }
    }

    checkScrollPerformance() {
        const now = performance.now();
        // Monitor for frame drops during scrolling
        requestAnimationFrame(() => {
            const frameDelta = performance.now() - now;
            // Only warn on significant jank and rate-limit the logs
            if (frameDelta > 24) {
                const t = performance.now();
                if (t - this._lastWarn > this._warnInterval) {
                    console.warn('Scroll performance issue detected:', frameDelta);
                    this._lastWarn = t;
                }
            }
        });
    }
}

// Initialize performance monitoring
const performanceMonitor = new ExperiencePerformanceMonitor();