// ===== SHARED UTILITIES AND COMPONENTS =====

// Utility Functions
const Utils = {
    // Debounce function for performance optimization
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Get current page name
    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path.includes('index.html')) return 'home';
        const pageName = path.split('/').pop().split('.')[0];
        return pageName || 'home';
    },

    // Smooth scroll to element
    scrollTo(element, offset = 80) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    },

    // Random number generator
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Format date
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    },

    // Animate counter
    animateCounter(element, target, duration = 1000) {
        const start = 0;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target;
            }
        };
        
        requestAnimationFrame(animate);
    },

    // Show notification using the global notification system
    showNotification(message, type = 'info', duration = 5000) {
        if (window.notifications && window.notifications.show) {
            return window.notifications.show(message, type, duration);
        } else {
            // Fallback to console if notification system isn't available
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
};

// Navigation Controller
class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navMenu = document.querySelector('.nav-menu');
        this.hamburger = document.querySelector('.hamburger');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.currentPage = Utils.getCurrentPage();
        
        this.init();
    }

    init() {
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.highlightCurrentPage();
        this.setupSmoothScrolling();
    }

    setupScrollEffect() {
        const handleScroll = Utils.throttle(() => {
            if (window.scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    setupMobileMenu() {
        if (!this.hamburger || !this.navMenu) return;

        this.hamburger.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navbar.contains(e.target) && this.navMenu.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    highlightCurrentPage() {
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const linkPage = href.split('/').pop().split('.')[0] || 'index';
            const isCurrentPage = linkPage === 'index' ? 
                this.currentPage === 'home' : 
                linkPage === this.currentPage;
            
            if (isCurrentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setupSmoothScrolling() {
        // Only for same-page anchors
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    Utils.scrollTo(href);
                    this.closeMobileMenu();
                });
            }
        });
    }
}

// Animation Observer
class AnimationObserver {
    constructor() {
        this.observedElements = new Set();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.observeElements();
    }

    // Public API to observe custom selectors with optional custom options
    observe(selector, options = null) {
        if (!selector) return;

        const elements = typeof selector === 'string'
            ? document.querySelectorAll(selector)
            : (selector instanceof NodeList || Array.isArray(selector))
                ? selector
                : [selector];

        // If custom options passed, create a temporary observer with those options
        if (options) {
            const tempObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateElement(entry.target);
                        tempObserver.unobserve(entry.target);
                    }
                });
            }, options);

            elements.forEach(el => tempObserver.observe(el));
            return;
        }

        // Otherwise use the default observer configured for this instance
        if (this.observer) {
            elements.forEach(el => this.observer.observe(el));
        }
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.observedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.observedElements.add(entry.target);
                }
            });
        }, options);
    }

    observeElements() {
        // Observe all elements with animation classes
        const animationClasses = [
            '.fade-in-up',
            '.fade-in-down',
            '.fade-in-left',
            '.fade-in-right',
            '.scale-in'
        ];

        animationClasses.forEach(className => {
            document.querySelectorAll(className).forEach(element => {
                this.observer.observe(element);
            });
        });
    }

    animateElement(element) {
        element.classList.add('visible');
        
        // Add stagger effect for grouped elements
        if (element.parentElement) {
            const siblings = Array.from(element.parentElement.children)
                .filter(child => child.classList.contains(element.classList[0]));
            const index = siblings.indexOf(element);
            
            if (siblings.length > 1) {
                element.style.transitionDelay = `${index * 100}ms`;
            }
        }

        // Trigger counter animations
        const counters = element.querySelectorAll('[data-counter]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-counter'));
            Utils.animateCounter(counter, target);
        });
    }

    // Method to manually trigger animations
    triggerAnimation(element) {
        if (element && !this.observedElements.has(element)) {
            this.animateElement(element);
            this.observedElements.add(element);
        }
    }
}

// Theme Controller
class ThemeController {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.init();
    }

    init() {
        this.applyTheme();
        this.createThemeToggle();
        this.watchSystemTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    createThemeToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.innerHTML = `
            <span class="theme-icon">${this.currentTheme === 'dark' ? '☀️' : '🌙'}</span>
        `;
        toggle.setAttribute('aria-label', 'Toggle theme');
        
        toggle.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: none;
            background: var(--primary-gradient);
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: var(--shadow-xl);
            z-index: 1000;
            transition: all var(--transition-normal);
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        toggle.addEventListener('click', () => this.toggleTheme());
        
        toggle.addEventListener('mouseenter', () => {
            toggle.style.transform = 'scale(1.1)';
        });
        
        toggle.addEventListener('mouseleave', () => {
            toggle.style.transform = 'scale(1)';
        });

        document.body.appendChild(toggle);
        this.toggleButton = toggle;
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        
        if (this.toggleButton) {
            const icon = this.toggleButton.querySelector('.theme-icon');
            icon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.currentTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme();
                }
            });
        }
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            jsExecutionTime: 0
        };
        this.init();
    }

    init() {
        this.measureLoadTime();
        this.setupImageOptimization();
        // Removed font CSS preloads to avoid Chrome warnings about unused preloads.
        // Fonts are already included via <link rel="stylesheet"> in each page head
        // with proper preconnect hints.
    }

    measureLoadTime() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            this.metrics.loadTime = perfData.loadEventEnd - perfData.navigationStart;
            
            if (this.metrics.loadTime > 3000) {
                console.warn('Page load time is above 3 seconds:', this.metrics.loadTime + 'ms');
            }
        });
    }

    setupImageOptimization() {
        // Lazy loading for images
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        } else {
            // Fallback for older browsers
            this.setupIntersectionObserverForImages();
        }
    }

    setupIntersectionObserverForImages() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Note: Intentionally left as a no-op. Keeping the method for backward
    // compatibility in case other code calls it, but we avoid using preload
    // for Google Fonts CSS. If needed in the future, prefer adding
    // <link rel="preconnect"> hints in HTML over dynamic preloads.
    preloadCriticalResources() {}
}

// Loading Controller
class LoadingController {
    constructor() {
        this.init();
    }

    init() {
        this.createLoadingOverlay();
        this.handlePageLoad();
    }

    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <p class="loading-text">Loading...</p>
            </div>
        `;
        
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            transition: opacity 0.5s ease, visibility 0.5s ease;
        `;

        const styles = document.createElement('style');
        styles.textContent = `
            .loading-content {
                text-align: center;
                color: white;
            }
            
            .loading-spinner {
                position: relative;
                width: 80px;
                height: 80px;
                margin: 0 auto 2rem;
            }
            
            .spinner-ring {
                position: absolute;
                width: 100%;
                height: 100%;
                border: 3px solid transparent;
                border-top: 3px solid rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                animation: spin 1.5s linear infinite;
            }
            
            .spinner-ring:nth-child(2) {
                width: 60px;
                height: 60px;
                top: 10px;
                left: 10px;
                animation-delay: -0.5s;
                border-top-color: rgba(255, 255, 255, 0.6);
            }
            
            .spinner-ring:nth-child(3) {
                width: 40px;
                height: 40px;
                top: 20px;
                left: 20px;
                animation-delay: -1s;
                border-top-color: rgba(255, 255, 255, 0.4);
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-text {
                font-size: 1.25rem;
                font-weight: 600;
                margin: 0;
                opacity: 0.9;
            }
        `;
        
        document.head.appendChild(styles);
        document.body.appendChild(overlay);
        
        this.overlay = overlay;
    }

    handlePageLoad() {
        const hideLoading = () => {
            if (this.overlay) {
                this.overlay.style.opacity = '0';
                this.overlay.style.visibility = 'hidden';
                setTimeout(() => {
                    if (this.overlay && this.overlay.parentNode) {
                        this.overlay.parentNode.removeChild(this.overlay);
                    }
                }, 500);
            }
        };

        if (document.readyState === 'complete') {
            hideLoading();
        } else {
            window.addEventListener('load', hideLoading);
        }
    }
}

// Notification System
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            max-width: 400px;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        `;

        notification.style.cssText = `
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transform: translateX(100%);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            word-wrap: break-word;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: 1rem;
            opacity: 0.8;
            transition: opacity 0.2s;
        `;

        closeBtn.addEventListener('click', () => this.hide(notification));

        this.container.appendChild(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto-hide
        if (duration > 0) {
            setTimeout(() => this.hide(notification), duration);
        }

        return notification;
    }

    hide(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Initialize shared components
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all shared components
    window.navigation = new Navigation();
    window.animationObserver = new AnimationObserver();
    window.themeController = new ThemeController();
    window.performanceMonitor = new PerformanceMonitor();
    window.loadingController = new LoadingController();
    window.notifications = new NotificationSystem();

    // Add global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Theme toggle with Ctrl/Cmd + Shift + T
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            window.themeController.toggleTheme();
        }
    });

    // Add smooth page transitions
    window.addEventListener('beforeunload', () => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
    });

    // Initialize page-specific functionality
    const currentPage = Utils.getCurrentPage();
    if (window.pageController && typeof window.pageController.init === 'function') {
        window.pageController.init();
    }

    // Lightweight global mutation logger to help detect accidental hiding of elements
    // (e.g. someone adding `.hidden` or `style.display = 'none'`). We specifically
    // restore `.contact-methods` if it becomes hidden so the contact page doesn't
    // silently drop UI while we track down the root cause.
    try {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                // Only care about attribute changes (class/style) and newly added/removed nodes
                if (m.type === 'attributes') {
                    const el = m.target;
                    // Defensive checks: ensure element exists and is an Element
                    if (!(el instanceof Element)) return;

                    const comp = window.getComputedStyle(el);

                    // If element was hidden via style/class/opacity, log it
                    if (comp.display === 'none' || comp.visibility === 'hidden' || comp.opacity === '0' || el.classList.contains('hidden')) {
                        const msg = `[MutationLogger] Element hidden: ${el.tagName}.${el.className} (id=${el.id || ''}) changed attribute=${m.attributeName}`;
                        console.warn(msg);
                        console.warn(new Error().stack.split('\n').slice(1,6).join('\n'));

                        // If this element is or contains the contact-methods container, restore it
                        const contactContainer = el.matches && el.matches('.contact-methods') ? el : el.closest && el.closest('.contact-methods');
                        if (contactContainer) {
                            console.warn('[MutationLogger] Restoring .contact-methods visibility');
                            contactContainer.classList.remove('hidden');
                            contactContainer.style.display = 'flex';
                            contactContainer.style.visibility = 'visible';
                            contactContainer.style.opacity = '1';
                            contactContainer.querySelectorAll('.contact-method').forEach(child => {
                                child.style.display = 'flex';
                                child.style.visibility = 'visible';
                                child.style.opacity = '';
                            });
                        }
                    }
                }

                // If nodes were added/removed, inspect added nodes for hidden state
                if (m.type === 'childList' && m.addedNodes && m.addedNodes.length) {
                    m.addedNodes.forEach(node => {
                        if (!(node instanceof Element)) return;
                        const comp = window.getComputedStyle(node);
                        if (comp.display === 'none' || node.classList.contains('hidden')) {
                            console.warn(`[MutationLogger] Added node hidden: ${node.tagName}.${node.className}`);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style'], childList: true });
        // Keep reference in window for debugging in console
        window.__mutationLogger = observer;
    } catch (err) {
        console.error('Failed to start mutation logger', err);
    }

    // console.log(`🚀 Portfolio loaded successfully! Current page: ${currentPage}`);
});

// Export utilities and classes for use in other scripts
window.Utils = Utils;
window.Navigation = Navigation;
window.AnimationObserver = AnimationObserver;
window.ThemeController = ThemeController;
window.NotificationSystem = NotificationSystem;