// ===== SKILLS PAGE CONTROLLER =====

class SkillsPageController {
    constructor() {
        this.initialize();
        this.animationObserver = new AnimationObserver();
        this.skillsFilterController = new SkillsFilterController();
        this.skillBarsController = new SkillBarsController();
        this.radarChartController = new RadarChartController();
        this.learningTimelineController = new LearningTimelineController();
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
        this.animationObserver.observe('.skill-category', {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        this.animationObserver.observe('.timeline-item', {
            threshold: 0.3
        });

        this.animationObserver.observe('.certification-card', {
            threshold: 0.4
        });

        this.animationObserver.observe('.tool-item', {
            threshold: 0.1,
            rootMargin: '0px 0px -20px 0px'
        });
    }

    startPageAnimations() {
        this.animateHeaderElements();
        this.startFloatingShapes();
        this.startMatrixAnimation();
    }

    animateHeaderElements() {
        const timeline = gsap.timeline({ delay: 0.5 });
        
        timeline
            .from('.title-line', {
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out'
            })
            .from('.page-subtitle', {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out'
            }, '-=0.5')
            .from('.overview-item', {
                y: 50,
                opacity: 0,
                scale: 0.9,
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.7)'
            }, '-=0.4');
    }

    startFloatingShapes() {
        const shapes = document.querySelectorAll('.shape');
        
        shapes.forEach((shape, index) => {
            gsap.set(shape, {
                rotation: Math.random() * 360,
                scale: 0.8 + Math.random() * 0.4
            });

            gsap.to(shape, {
                y: -20 - Math.random() * 20,
                rotation: `+=${360 + Math.random() * 180}`,
                duration: 15 + Math.random() * 10,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: index * 2
            });
        });
    }

    startMatrixAnimation() {
        const matrixLines = document.querySelectorAll('.matrix-line');
        
        matrixLines.forEach((line, index) => {
            gsap.fromTo(line, {
                x: '-100%',
                opacity: 0
            }, {
                x: '100vw',
                opacity: 0.6,
                duration: 15,
                repeat: -1,
                delay: index * 2.5,
                ease: 'none'
            });
        });
    }

    handleScroll() {
        this.updateParallaxElements();
    }

    updateParallaxElements() {
        const scrollY = window.scrollY;
        const headerBackground = document.querySelector('.header-background');
        
        if (headerBackground) {
            const parallaxSpeed = 0.3;
            headerBackground.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
        }
    }

    handleResize() {
        this.radarChartController.resize();
    }
}

// ===== SKILLS FILTER CONTROLLER =====

class SkillsFilterController {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.skillCategories = document.querySelectorAll('.skill-category');
        this.activeFilter = 'all';
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleFilterClick(button);
            });
        });
    }

    handleFilterClick(button) {
        const category = button.dataset.category;
        
        // Update active button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter skills
        this.filterSkills(category);
        this.activeFilter = category;
    }

    filterSkills(category) {
        this.skillCategories.forEach((skillCategory, index) => {
            const shouldShow = category === 'all' || 
                              skillCategory.dataset.category === category;
            
            if (shouldShow) {
                skillCategory.classList.remove('hidden');
                gsap.to(skillCategory, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: 'power2.out'
                });
            } else {
                gsap.to(skillCategory, {
                    opacity: 0,
                    y: -20,
                    scale: 0.9,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        skillCategory.classList.add('hidden');
                    }
                });
            }
        });
    }
}

// ===== SKILL BARS CONTROLLER =====

class SkillBarsController {
    constructor() {
        this.skillItems = document.querySelectorAll('.skill-item');
        this.animatedBars = new Set();
        
        this.initialize();
    }

    initialize() {
        this.setupIntersectionObserver();
        this.setupHoverEffects();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSkillBar(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });

        this.skillItems.forEach(item => {
            observer.observe(item);
        });
    }

    animateSkillBar(skillItem) {
        const progressBar = skillItem.querySelector('.skill-progress');
        const progressValue = progressBar.dataset.progress;
        
        if (!this.animatedBars.has(skillItem)) {
            // Animate the skill bar fill
            gsap.to(progressBar, {
                width: `${progressValue}%`,
                duration: 2,
                delay: 0.5,
                ease: 'power2.out'
            });

            // Animate skill tags
            const skillTags = skillItem.querySelectorAll('.skill-tag');
            gsap.from(skillTags, {
                scale: 0,
                opacity: 0,
                duration: 0.4,
                stagger: 0.1,
                delay: 1,
                ease: 'back.out(1.7)'
            });

            this.animatedBars.add(skillItem);
        }
    }

    setupHoverEffects() {
        this.skillItems.forEach(item => {
            const progressBar = item.querySelector('.skill-progress');
            const skillTags = item.querySelectorAll('.skill-tag');

            item.addEventListener('mouseenter', () => {
                gsap.to(item, {
                    y: -10,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    duration: 0.3,
                    ease: 'power2.out'
                });

                gsap.to(progressBar, {
                    filter: 'brightness(1.1)',
                    duration: 0.3
                });

                gsap.to(skillTags, {
                    y: -2,
                    duration: 0.2,
                    stagger: 0.05,
                    ease: 'power2.out'
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(item, {
                    y: 0,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    duration: 0.3,
                    ease: 'power2.out'
                });

                gsap.to(progressBar, {
                    filter: 'brightness(1)',
                    duration: 0.3
                });

                gsap.to(skillTags, {
                    y: 0,
                    duration: 0.2,
                    stagger: 0.05,
                    ease: 'power2.out'
                });
            });
        });
    }
}

// ===== RADAR CHART CONTROLLER =====

class RadarChartController {
    constructor() {
        this.canvas = document.getElementById('skillsRadarChart');
        this.ctx = this.canvas?.getContext('2d');
        this.chart = null;
        
        if (this.canvas) {
            this.initialize();
        }
    }

    initialize() {
        this.createChart();
        this.setupAnimation();
    }

    createChart() {
        const data = {
            labels: [
                'Frontend Development',
                'Backend Development', 
                'Database Management',
                'Cloud & DevOps',
                'Development Tools'
            ],
            datasets: [{
                label: 'Skill Level',
                data: [92, 85, 79, 75, 89],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: '#667eea',
                borderWidth: 3,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        showLabelBackdrop: false,
                        color: '#666',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: '#e0e0e0'
                    },
                    angleLines: {
                        color: '#e0e0e0'
                    },
                    pointLabels: {
                        color: '#333',
                        font: {
                            size: 14,
                            weight: '500'
                        }
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        };

        this.chart = new Chart(this.ctx, {
            type: 'radar',
            data: data,
            options: options
        });
    }

    setupAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.chart.update('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        if (this.canvas) {
            observer.observe(this.canvas.parentElement);
        }
    }

    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }
}

// ===== LEARNING TIMELINE CONTROLLER =====

class LearningTimelineController {
    constructor() {
        this.timelineItems = document.querySelectorAll('.timeline-item');
        
        this.initialize();
    }

    initialize() {
        this.setupAnimations();
        this.addHoverEffects();
    }

    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateTimelineItem(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });

        this.timelineItems.forEach(item => {
            observer.observe(item);
        });
    }

    animateTimelineItem(item) {
        const timeline = gsap.timeline();
        
        // Animate main content
        timeline.to(item, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out'
        });

        // Animate marker
        const marker = item.querySelector('.timeline-marker');
        timeline.from(marker, {
            scale: 0,
            rotation: 180,
            duration: 0.6,
            ease: 'back.out(1.7)'
        }, '-=0.4');

        // Animate skills tags
        const skillsTags = item.querySelectorAll('.timeline-skills span');
        if (skillsTags.length > 0) {
            timeline.from(skillsTags, {
                y: 20,
                opacity: 0,
                duration: 0.4,
                stagger: 0.1,
                ease: 'power2.out'
            }, '-=0.2');
        }
    }

    addHoverEffects() {
        this.timelineItems.forEach(item => {
            const content = item.querySelector('.timeline-content');
            
            content.addEventListener('mouseenter', () => {
                gsap.to(content, {
                    y: -5,
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.15)',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            content.addEventListener('mouseleave', () => {
                gsap.to(content, {
                    y: 0,
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });
    }
}

// ===== CERTIFICATIONS CONTROLLER =====

class CertificationsController {
    constructor() {
        this.certCards = document.querySelectorAll('.certification-card');
        
        this.initialize();
    }

    initialize() {
        this.setupAnimations();
        this.addInteractiveEffects();
    }

    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCertificationCard(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.4,
            rootMargin: '0px 0px -30px 0px'
        });

        this.certCards.forEach(card => {
            observer.observe(card);
        });
    }

    animateCertificationCard(card) {
        const timeline = gsap.timeline();
        
        timeline
            .from(card, {
                y: 50,
                opacity: 0,
                scale: 0.9,
                duration: 0.6,
                ease: 'power2.out'
            })
            .from(card.querySelector('.cert-badge'), {
                scale: 0,
                rotation: 360,
                duration: 0.5,
                ease: 'back.out(1.7)'
            }, '-=0.3')
            .from(card.querySelectorAll('.cert-skills span'), {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                stagger: 0.05,
                ease: 'back.out(1.7)'
            }, '-=0.2');
    }

    addInteractiveEffects() {
        this.certCards.forEach(card => {
            const badge = card.querySelector('.cert-badge');
            const skills = card.querySelectorAll('.cert-skills span');

            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    y: -10,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    duration: 0.3,
                    ease: 'power2.out'
                });

                gsap.to(badge, {
                    rotation: 10,
                    scale: 1.1,
                    duration: 0.3,
                    ease: 'power2.out'
                });

                gsap.to(skills, {
                    y: -2,
                    duration: 0.2,
                    stagger: 0.03,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    y: 0,
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    duration: 0.3,
                    ease: 'power2.out'
                });

                gsap.to(badge, {
                    rotation: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });

                gsap.to(skills, {
                    y: 0,
                    duration: 0.2,
                    stagger: 0.03,
                    ease: 'power2.out'
                });
            });
        });
    }
}

// ===== TOOLS CONTROLLER =====

class ToolsController {
    constructor() {
        this.toolItems = document.querySelectorAll('.tool-item');
        
        this.initialize();
    }

    initialize() {
        this.setupAnimations();
        this.addHoverEffects();
    }

    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateToolsCategory(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -30px 0px'
        });

        const toolCategories = document.querySelectorAll('.tools-category');
        toolCategories.forEach(category => {
            observer.observe(category);
        });
    }

    animateToolsCategory(category) {
        const toolItems = category.querySelectorAll('.tool-item');
        
        gsap.from(toolItems, {
            x: -30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }

    addHoverEffects() {
        this.toolItems.forEach(item => {
            const icon = item.querySelector('i');

            item.addEventListener('mouseenter', () => {
                gsap.to(item, {
                    x: 10,
                    duration: 0.3,
                    ease: 'power2.out'
                });

                gsap.to(icon, {
                    rotation: 10,
                    scale: 1.1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(item, {
                    x: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });

                gsap.to(icon, {
                    rotation: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });
    }
}

// ===== SKILLS SEARCH CONTROLLER =====

class SkillsSearchController {
    constructor() {
        this.searchInput = document.getElementById('skills-search');
        this.skillItems = document.querySelectorAll('.skill-item');
        
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
        
        this.skillItems.forEach(item => {
            const skillName = item.querySelector('.skill-name').textContent.toLowerCase();
            const skillTags = Array.from(item.querySelectorAll('.skill-tag'))
                .map(tag => tag.textContent.toLowerCase()).join(' ');
            
            const matches = !searchTerm || 
                           skillName.includes(searchTerm) || 
                           skillTags.includes(searchTerm);
            
            if (matches) {
                gsap.to(item, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                item.style.display = '';
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
}

// ===== SKILLS ANALYTICS =====

class SkillsAnalytics {
    constructor() {
        this.trackingData = {
            skillsViewed: new Set(),
            timeOnPage: 0,
            interactionCount: 0
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
            if (e.target.matches('.skill-item, .filter-btn, .tool-item')) {
                this.trackingData.interactionCount++;
                
                if (e.target.matches('.skill-item')) {
                    const skillName = e.target.querySelector('.skill-name')?.textContent;
                    if (skillName) {
                        this.trackingData.skillsViewed.add(skillName);
                    }
                }
            }
        });
    }

    sendAnalytics() {
        if (window.gtag) {
            window.gtag('event', 'skills_page_interaction', {
                event_category: 'Skills',
                event_label: 'Page Analytics',
                value: this.trackingData.interactionCount,
                custom_parameters: {
                    time_on_page: this.trackingData.timeOnPage,
                    skills_viewed: this.trackingData.skillsViewed.size
                }
            });
        }
    }
}

// ===== PERFORMANCE MONITOR =====

class SkillsPerformanceMonitor {
    constructor() {
        this.startTime = performance.now();
        this.setupMonitoring();
    }

    setupMonitoring() {
        window.addEventListener('load', () => {
            this.reportLoadTime();
        });

        // Monitor animation performance
        let animationFrameCount = 0;
        const checkAnimationPerformance = () => {
            animationFrameCount++;
            if (animationFrameCount % 60 === 0) { // Check every 60 frames
                const now = performance.now();
                requestAnimationFrame(() => {
                    const frameDelta = performance.now() - now;
                    if (frameDelta > 16.67) {
                        console.warn('Animation performance issue:', frameDelta);
                    }
                });
            }
            requestAnimationFrame(checkAnimationPerformance);
        };
        
        requestAnimationFrame(checkAnimationPerformance);
    }

    reportLoadTime() {
        const loadTime = performance.now() - this.startTime;
        console.log(`Skills page loaded in ${loadTime.toFixed(2)}ms`);
        
        if (window.gtag) {
            window.gtag('event', 'page_load_time', {
                event_category: 'Performance',
                event_label: 'Skills Page',
                value: Math.round(loadTime)
            });
        }
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    // Initialize main controller
    const skillsController = new SkillsPageController();
    
    // Initialize additional controllers
    const certificationsController = new CertificationsController();
    const toolsController = new ToolsController();
    const searchController = new SkillsSearchController();
    const analyticsController = new SkillsAnalytics();
    const performanceMonitor = new SkillsPerformanceMonitor();
    
    // Set up global references
    window.skillsPageController = skillsController;
    
    // Initialize theme controller if not present
    if (!window.themeController) {
        window.themeController = new ThemeController();
    }
    
    // Show success notification
    // Utils.showNotification('Skills page loaded successfully!', 'success');
});

// ===== UTILITY FUNCTIONS =====

class SkillsPageUtils {
    static calculateSkillLevel(percentage) {
        if (percentage >= 90) return 'Expert';
        if (percentage >= 80) return 'Advanced';
        if (percentage >= 65) return 'Intermediate';
        return 'Beginner';
    }

    static getSkillCategory(skillName) {
        const categories = {
            'frontend': ['javascript', 'react', 'vue', 'angular', 'html', 'css', 'typescript'],
            'backend': ['python', 'node.js', 'java', 'c#', 'php', 'ruby'],
            'database': ['postgresql', 'mongodb', 'mysql', 'redis', 'sqlite'],
            'cloud': ['aws', 'docker', 'kubernetes', 'ci/cd', 'azure', 'gcp'],
            'tools': ['git', 'vs code', 'postman', 'figma', 'photoshop']
        };
        
        const skill = skillName.toLowerCase();
        for (const [category, skills] of Object.entries(categories)) {
            if (skills.some(s => skill.includes(s))) {
                return category;
            }
        }
        return 'other';
    }

    static exportSkillsData() {
        const skillsData = {
            skills: [],
            certifications: [],
            tools: [],
            exportDate: new Date().toISOString()
        };

        // Collect skills data
        document.querySelectorAll('.skill-item').forEach(item => {
            skillsData.skills.push({
                name: item.querySelector('.skill-name')?.textContent,
                level: item.querySelector('.skill-level')?.textContent,
                experience: item.querySelector('.skill-experience')?.textContent,
                progress: item.querySelector('.skill-progress')?.dataset.progress,
                tags: Array.from(item.querySelectorAll('.skill-tag')).map(tag => tag.textContent)
            });
        });

        return skillsData;
    }
}