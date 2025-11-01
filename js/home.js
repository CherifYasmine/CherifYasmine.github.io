// ===== HOME PAGE SPECIFIC JAVASCRIPT =====

class HomePageController {
    constructor() {
        this.typingWords = [];
        this.currentWordIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.typingSpeed = 150;
        this.deleteSpeed = 100;
        this.pauseTime = 2000;
        
        this.init();
    }

    init() {
        this.setupTypingAnimation();
        this.setupSkillOrbitInteraction();
        this.setupCodeRainEffect();
        this.setupParallaxScrolling();
        this.setupServiceCardAnimations();
        this.setupStatsAnimation();
    }

    // Typing Animation
    setupTypingAnimation() {
        const typingElement = document.querySelector('.typing-animation');
        if (!typingElement) return;

        const wordsData = typingElement.getAttribute('data-words');
        if (!wordsData) return;

        this.typingWords = wordsData.split(',');
        this.typeWords(typingElement);
    }

    typeWords(element) {
        const currentWord = this.typingWords[this.currentWordIndex];
        
        if (this.isDeleting) {
            // Deleting characters
            element.textContent = currentWord.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
            
            if (this.currentCharIndex === 0) {
                this.isDeleting = false;
                this.currentWordIndex = (this.currentWordIndex + 1) % this.typingWords.length;
                setTimeout(() => this.typeWords(element), this.pauseTime / 2);
                return;
            }
            
            setTimeout(() => this.typeWords(element), this.deleteSpeed);
        } else {
            // Typing characters
            element.textContent = currentWord.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
            
            if (this.currentCharIndex === currentWord.length) {
                this.isDeleting = true;
                setTimeout(() => this.typeWords(element), this.pauseTime);
                return;
            }
            
            setTimeout(() => this.typeWords(element), this.typingSpeed);
        }
    }

    // Skill Orbit Interaction
    setupSkillOrbitInteraction() {
        const skillItems = document.querySelectorAll('.skill-item');
        const skillOrbit = document.querySelector('.skill-orbit');
        
        skillItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                skillOrbit.style.animationPlayState = 'paused';
                this.showSkillTooltip(item);
            });
            
            item.addEventListener('mouseleave', () => {
                skillOrbit.style.animationPlayState = 'running';
                this.hideSkillTooltip();
            });
        });
    }

    showSkillTooltip(item) {
        const skillName = item.getAttribute('data-skill');
        if (!skillName) return;

        // Remove existing tooltip
        this.hideSkillTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'skill-tooltip';
        tooltip.textContent = skillName;
        tooltip.style.cssText = `
            position: absolute;
            bottom: -40px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--dark-bg-primary);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
            animation: fadeInUp 0.3s ease-out;
        `;

        item.appendChild(tooltip);
    }

    hideSkillTooltip() {
        const existingTooltip = document.querySelector('.skill-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
    }

    // Code Rain Effect Enhancement
    setupCodeRainEffect() {
        const codeRain = document.querySelector('.code-rain');
        if (!codeRain) return;

        // Create multiple rain streams
        for (let i = 0; i < 3; i++) {
            const stream = document.createElement('div');
            stream.className = 'code-stream';
            stream.style.cssText = `
                position: absolute;
                top: 0;
                left: ${20 + i * 30}%;
                width: 2px;
                height: 100%;
                background: linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent);
                animation: streamFlow ${15 + i * 5}s linear infinite;
                animation-delay: ${i * 2}s;
            `;
            codeRain.appendChild(stream);
        }

        // Add keyframes for stream animation
        if (!document.querySelector('#stream-keyframes')) {
            const style = document.createElement('style');
            style.id = 'stream-keyframes';
            style.textContent = `
                @keyframes streamFlow {
                    0% { transform: translateY(-100vh); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Parallax Scrolling Effect
    setupParallaxScrolling() {
        const heroShapes = document.querySelectorAll('.geometric-shape');
        const codeWindow = document.querySelector('.code-window');
        
        const handleScroll = Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            // Move geometric shapes
            heroShapes.forEach((shape, index) => {
                const speed = 0.3 + (index * 0.1);
                shape.style.transform = `translateY(${scrolled * speed}px)`;
            });
            
            // Parallax effect for code window
            if (codeWindow) {
                codeWindow.style.transform = `translateY(${parallax * 0.2}px)`;
            }
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    // Service Card Animations
    setupServiceCardAnimations() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                // Add ripple effect
                this.createRippleEffect(card, event);
                
                // Animate icon
                const icon = card.querySelector('.service-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.service-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }

    createRippleEffect(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        element.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
        
        // Add ripple keyframes if not exists
        if (!document.querySelector('#ripple-keyframes')) {
            const style = document.createElement('style');
            style.id = 'ripple-keyframes';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Stats Counter Animation
    setupStatsAnimation() {
        const statNumbers = document.querySelectorAll('.stat-number[data-counter]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const target = parseInt(element.getAttribute('data-counter'));
                    this.animateCounter(element, target);
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(stat => observer.observe(stat));
    }

    animateCounter(element, target) {
        const duration = 1000;
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Linear animation (no easing)
            const current = Math.floor(progress * target);
            
            // Add + sign for numbers and format
            const suffix = target > 10 ? '+' : '';
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target + suffix;
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Intersection Observer for fade-in animations
    setupScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add stagger effect for grouped elements
                    if (entry.target.parentElement) {
                        const siblings = Array.from(entry.target.parentElement.children)
                            .filter(child => child.classList.contains('fade-in-up'));
                        const index = siblings.indexOf(entry.target);
                        
                        if (siblings.length > 1) {
                            entry.target.style.transitionDelay = `${index * 100}ms`;
                        }
                    }
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right')
            .forEach(el => observer.observe(el));
    }

    // Dynamic background generation
    setupDynamicBackground() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        // Create floating particles
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Utils.random(4, 8)}px;
                height: ${Utils.random(4, 8)}px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                left: ${Utils.random(0, 100)}%;
                top: ${Utils.random(0, 100)}%;
                animation: floatRandom ${Utils.random(10, 20)}s ease-in-out infinite;
                animation-delay: ${Utils.random(0, 5)}s;
                pointer-events: none;
            `;
            hero.appendChild(particle);
        }

        // Add keyframes for floating particles
        if (!document.querySelector('#float-keyframes')) {
            const style = document.createElement('style');
            style.id = 'float-keyframes';
            style.textContent = `
                @keyframes floatRandom {
                    0%, 100% { 
                        transform: translateY(0px) translateX(0px) rotate(0deg);
                        opacity: 0.3;
                    }
                    25% { 
                        transform: translateY(-20px) translateX(10px) rotate(90deg);
                        opacity: 0.6;
                    }
                    50% { 
                        transform: translateY(-10px) translateX(-15px) rotate(180deg);
                        opacity: 0.3;
                    }
                    75% { 
                        transform: translateY(-30px) translateX(5px) rotate(270deg);
                        opacity: 0.8;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Enhanced scroll indicator
    setupScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (!scrollIndicator) return;

        const handleScroll = Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            const threshold = window.innerHeight * 0.1;
            
            if (scrolled > threshold) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.transform = 'translateX(-50%) translateY(20px)';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.transform = 'translateX(-50%) translateY(0)';
            }
        }, 10);

        window.addEventListener('scroll', handleScroll);

        // Smooth scroll on click
        scrollIndicator.addEventListener('click', () => {
            const aboutSection = document.querySelector('.about-preview');
            if (aboutSection) {
                Utils.scrollTo(aboutSection);
            }
        });
    }

    // Code window syntax highlighting animation
    setupCodeHighlighting() {
        const codeLines = document.querySelectorAll('.code-line');
        
        codeLines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('highlighted');
                
                // Add glow effect to keywords
                const keywords = line.querySelectorAll('.keyword, .class-name, .function');
                keywords.forEach(keyword => {
                    keyword.style.textShadow = '0 0 10px currentColor';
                });
            }, 1000 + (index * 200));
        });
    }

    // Performance monitoring for animations
    monitorPerformance() {
        let frameCount = 0;
        let lastTime = performance.now();

        const checkFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // Reduce animations if FPS is too low
                if (fps < 30) {
                    document.documentElement.classList.add('reduce-animations');
                } else {
                    document.documentElement.classList.remove('reduce-animations');
                }
            }
            
            requestAnimationFrame(checkFPS);
        };
        
        requestAnimationFrame(checkFPS);

        // CSS for reduced animations
        if (!document.querySelector('#performance-css')) {
            const style = document.createElement('style');
            style.id = 'performance-css';
            style.textContent = `
                .reduce-animations * {
                    animation-duration: 0.1s !important;
                    transition-duration: 0.1s !important;
                }
                .reduce-animations .geometric-shape,
                .reduce-animations .skill-orbit,
                .reduce-animations .code-rain {
                    animation: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Enhanced scroll animations
class ScrollAnimationController {
    constructor() {
        this.init();
    }

    init() {
        this.setupRevealAnimations();
        this.setupParallaxElements();
        this.setupProgressIndicator();
    }

    setupRevealAnimations() {
        const elements = document.querySelectorAll('[class*="fade-in"]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 50);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }

    setupParallaxElements() {
        const parallaxElements = document.querySelectorAll('.hero-visual, .geometric-shape');
        
        const handleScroll = Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }, 16);

        window.addEventListener('scroll', handleScroll);
    }

    setupProgressIndicator() {
        // Create a reading progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: var(--primary-gradient);
            z-index: 10001;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        const updateProgress = Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrolled / maxScroll) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }, 10);

        window.addEventListener('scroll', updateProgress);
    }
}

// Initialize page controller
document.addEventListener('DOMContentLoaded', () => {
    window.pageController = new HomePageController();
    window.scrollAnimationController = new ScrollAnimationController();
    
    // Performance monitoring
    window.pageController.monitorPerformance();
    
    // Setup all animations
    window.pageController.setupScrollAnimations();
    window.pageController.setupDynamicBackground();
    window.pageController.setupScrollIndicator();
    window.pageController.setupCodeHighlighting();
    
    console.log('🏠 Home page loaded and ready!');
});

// Export for potential use in other scripts
window.HomePageController = HomePageController;