// ===== CONTACT PAGE CONTROLLER =====

class ContactPageController {
    constructor() {
        // Ensure controllers exist before running initialization to avoid
        // runtime errors that can abort script execution (and hide UI).
        this.animationObserver = new AnimationObserver();
        this.contactFormController = new ContactFormController();
        this.faqController = new FAQController();

        // Run initialization after dependent controllers are ready
        this.initialize();
        // Protect contact methods from being accidentally hidden by other scripts
        this.observeContactMethods();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeComponents();
        // startPageAnimations is triggered on window.load; avoid calling
        // a non-existent startAnimations() which would throw.
        // After the entrance animations likely finish, enforce visible state
        window.addEventListener('load', () => {
            setTimeout(() => this.ensureContactMethodsVisible(), 1800);
        });
    }

    // Watch for runtime changes that hide the contact methods and restore them.
    observeContactMethods() {
        try {
            const container = document.querySelector('.contact-methods');
            if (!container) return;

            // Restore baseline display (don't force opacity so GSAP can animate)
            container.style.display = '';

            const mo = new MutationObserver((mutations) => {
                mutations.forEach(m => {
                    // If a style or class change hides the container, restore it
                    if (m.type === 'attributes') {
                        const el = m.target;
                        const comp = window.getComputedStyle(el);
                        if (
                            comp.display === 'none' ||
                            comp.visibility === 'hidden' ||
                            comp.opacity === '0' ||
                            el.classList.contains('hidden')
                        ) {
                            console.warn('[Contact] Restoring contact-methods visibility due to', m.attributeName, m);
                            el.classList.remove('hidden');
                            el.style.display = 'flex';
                            el.style.visibility = 'visible';
                            el.style.opacity = '1';
                            el.querySelectorAll('.contact-method').forEach(child => {
                                child.style.display = 'flex';
                                child.style.visibility = 'visible';
                                child.style.opacity = '';
                            });
                        }
                    }
                });
            });

            mo.observe(container, { attributes: true, attributeFilter: ['class', 'style'] });
            mo.observe(container, { childList: true, subtree: true });
            this._contactMethodsObserver = mo;
        } catch (err) {
            console.error('[Contact] Failed to attach MutationObserver', err);
        }
    }

    setupEventListeners() {
        window.addEventListener('load', () => {
            this.startPageAnimations();
        });

        window.addEventListener('scroll', Utils.throttle(() => {
            this.handleScroll();
        }, 16));
    }

    initializeComponents() {
        // Initialize intersection observers for animations
        this.animationObserver.observe('.contact-card', {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });

        this.animationObserver.observe('.faq-item', {
            threshold: 0.2
        });
    }

    startPageAnimations() {
        this.animateHeaderElements();
        this.startFloatingElements();
        this.startParticleSystem();
    }

    // Final safety net after entrance animations: enforce visible state
    ensureContactMethodsVisible() {
        const container = document.querySelector('.contact-methods');
        if (!container) return;
        const comp = window.getComputedStyle(container);
        if (comp.display === 'none' || comp.visibility === 'hidden' || comp.opacity === '0' || container.classList.contains('hidden')) {
            console.warn('[Contact] Post-animation guard restoring .contact-methods');
            container.classList.remove('hidden');
            container.style.display = 'flex';
            container.style.visibility = 'visible';
            container.style.opacity = '1';
        }
        container.querySelectorAll('.contact-method').forEach(item => {
            const s = window.getComputedStyle(item);
            if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0' || item.classList.contains('hidden')) {
                item.classList.remove('hidden');
                item.style.display = 'flex';
                item.style.visibility = 'visible';
                item.style.opacity = '1';
            }
        });
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
            .from('.contact-method', {
                y: 30,
                opacity: 0,
                scale: 0.9,
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.7)'
            }, '-=0.4');
    }

    startFloatingElements() {
        const floatingElements = document.querySelectorAll('.float-icon');
        
        floatingElements.forEach((element, index) => {
            gsap.set(element, {
                y: Math.random() * 20 - 10
            });

            gsap.to(element, {
                y: '+=30',
                duration: 4 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: index * 0.5
            });
        });
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

    handleScroll() {
        this.updateParallaxElements();
    }

    updateParallaxElements() {
        const scrollY = window.scrollY;
        const headerBackground = document.querySelector('.header-background');
        
        if (headerBackground) {
            const parallaxSpeed = 0.4;
            headerBackground.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
        }
    }
}

// ===== CONTACT FORM CONTROLLER =====

// Backend endpoint configuration
// Formspree endpoint for handling contact form submissions
// Docs: https://formspree.io
const CONTACT_FORM_ENDPOINT = 'https://formspree.io/f/mnnoyjqy';

class ContactFormController {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.submitButton = null;
        this.modal = document.getElementById('success-modal');
        
        if (this.form) {
            this.submitButton = this.form.querySelector('.submit-btn');
            this.initialize();
        }
    }

    initialize() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupCharacterCounter();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        // Modal close handlers
        if (this.modal) {
            const closeBtn = this.modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModal();
                });
            }

            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    setupCharacterCounter() {
        const messageTextarea = this.form.querySelector('#message');
        const currentCount = this.form.querySelector('.current-count');
        const maxCount = 1000;

        if (messageTextarea && currentCount) {
            messageTextarea.addEventListener('input', () => {
                const count = messageTextarea.value.length;
                currentCount.textContent = count;
                
                if (count > maxCount) {
                    messageTextarea.value = messageTextarea.value.substring(0, maxCount);
                    currentCount.textContent = maxCount;
                }
                
                // Color coding
                if (count > maxCount * 0.9) {
                    currentCount.style.color = 'var(--error-color, #ef4444)';
                } else if (count > maxCount * 0.8) {
                    currentCount.style.color = 'var(--warning-color, #f59e0b)';
                } else {
                    currentCount.style.color = 'var(--text-secondary)';
                }
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        const errorElement = field.parentNode.querySelector('.form-error');
        
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.required && !value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} is required.`;
        }
        
        // Email validation
        else if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        }
        
        // Phone validation
        else if (fieldName === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number.';
            }
        }
        
        // Message length validation
        else if (fieldName === 'message' && value) {
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters long.';
            }
        }

        // Update UI
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
        
        field.classList.toggle('error', !isValid);
        return isValid;
    }

    clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.form-error');
        if (errorElement) {
            errorElement.textContent = '';
        }
        field.classList.remove('error');
    }

    getFieldLabel(fieldName) {
        const labels = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email Address',
            phone: 'Phone Number',
            company: 'Company',
            subject: 'Subject',
            budget: 'Budget',
            timeline: 'Timeline',
            message: 'Message'
        };
        return labels[fieldName] || fieldName;
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        // Privacy policy checkbox
        const privacyCheckbox = this.form.querySelector('#privacy');
        if (privacyCheckbox && !privacyCheckbox.checked) {
            const errorElement = privacyCheckbox.closest('.form-group').querySelector('.form-error');
            if (errorElement) {
                errorElement.textContent = 'You must agree to the Privacy Policy and Terms of Service.';
            }
            isFormValid = false;
        }

        return isFormValid;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            Utils.showNotification('Please correct the errors in the form.', 'error');
            return;
        }

        const originalText = this.submitButton.innerHTML;
        
        // Update button state
        this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        this.submitButton.disabled = true;

        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            // Submit to configured backend endpoint
            await this.submitForm(formData);
            
            this.showSuccessModal();
            this.form.reset();
            
            // Reset character counter
            const currentCount = this.form.querySelector('.current-count');
            if (currentCount) {
                currentCount.textContent = '0';
                currentCount.style.color = 'var(--text-secondary)';
            }
            
            // Analytics
            if (window.gtag) {
                gtag('event', 'contact_form_submit', {
                    event_category: 'Contact',
                    event_label: data.subject || 'General Inquiry'
                });
            }

        } catch (error) {
            console.error('Form submission error:', error);
            Utils.showNotification('Failed to send message. Please try again later.', 'error');
        } finally {
            // Reset button state
            this.submitButton.innerHTML = originalText;
            this.submitButton.disabled = false;
        }
    }

    async submitForm(formData) {
        // Guard: backend not configured
        if (!CONTACT_FORM_ENDPOINT || /your_form_id/i.test(CONTACT_FORM_ENDPOINT)) {
            throw new Error('Contact form backend not configured. Please set CONTACT_FORM_ENDPOINT in js/contact.js');
        }

        const response = await fetch(CONTACT_FORM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });

        // Formspree returns 200 OK on success
        if (response.ok) {
            return await response.json().catch(() => ({ success: true }));
        }

        // Try to extract error details
        let errorDetail = 'Failed to send message. Please try again later.';
        try {
            const err = await response.json();
            if (err && err.errors && err.errors.length) {
                errorDetail = err.errors.map(e => e.message).join(' ');
            }
        } catch (_) { /* ignore JSON parse errors */ }

        throw new Error(errorDetail);
    }

    showSuccessModal() {
        if (this.modal) {
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Animate modal appearance
            const modalContent = this.modal.querySelector('.modal-content');
            gsap.fromTo(modalContent, {
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
    }

    closeModal() {
        if (this.modal) {
            const modalContent = this.modal.querySelector('.modal-content');
            gsap.to(modalContent, {
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
    }
}

// ===== FAQ CONTROLLER =====

class FAQController {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                this.toggleFAQ(item);
            });
        });
    }

    toggleFAQ(item) {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQ items
        this.faqItems.forEach(faqItem => {
            if (faqItem !== item) {
                faqItem.classList.remove('active');
            }
        });
        
        // Toggle current item
        if (isActive) {
            item.classList.remove('active');
        } else {
            item.classList.add('active');
            
            // Smooth scroll to keep the item in view
            setTimeout(() => {
                item.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }, 300);
        }
        
        // Analytics
        if (window.gtag && !isActive) {
            const question = item.querySelector('.faq-question h4').textContent;
            gtag('event', 'faq_expand', {
                event_category: 'Contact',
                event_label: question
            });
        }
    }
}

// ===== CONTACT ANALYTICS =====

class ContactAnalytics {
    constructor() {
        this.trackingData = {
            timeOnPage: 0,
            interactions: 0,
            sectionsViewed: new Set(),
            formFieldsInteracted: new Set()
        };
        
        this.initialize();
    }

    initialize() {
        this.startTimeTracking();
        this.setupInteractionTracking();
        this.setupSectionTracking();
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
            if (e.target.matches('.contact-method, .social-link, .faq-question, .btn')) {
                this.trackingData.interactions++;
            }
        });

        // Track form field interactions
        const formFields = document.querySelectorAll('#contact-form input, #contact-form select, #contact-form textarea');
        formFields.forEach(field => {
            field.addEventListener('focus', () => {
                this.trackingData.formFieldsInteracted.add(field.name);
            });
        });
    }

    setupSectionTracking() {
        const sections = document.querySelectorAll('.contact-form-section, .faq-section, .availability-section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionClass = entry.target.className.split(' ')[0];
                    this.trackingData.sectionsViewed.add(sectionClass);
                }
            });
        }, { threshold: 0.3 });

        sections.forEach(section => observer.observe(section));
    }

    sendAnalytics() {
        if (window.gtag) {
            gtag('event', 'contact_page_analytics', {
                event_category: 'Contact',
                event_label: 'Page Analytics',
                value: this.trackingData.interactions,
                custom_parameters: {
                    time_on_page: this.trackingData.timeOnPage,
                    sections_viewed: this.trackingData.sectionsViewed.size,
                    form_fields_interacted: this.trackingData.formFieldsInteracted.size
                }
            });
        }
    }
}

// ===== SCHEDULE CALL INTEGRATION =====

class ScheduleCallController {
    constructor() {
        this.scheduleButtons = document.querySelectorAll('.schedule-btn');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.scheduleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSchedulingModal();
            });
        });
    }

    openSchedulingModal() {
        // For now, show a simple modal with calendar integration options
        const modal = document.createElement('div');
        modal.className = 'schedule-modal modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-icon">
                    <i class="fas fa-calendar-plus"></i>
                </div>
                <h3 class="modal-title">Schedule a Call</h3>
                <p class="modal-text">
                    Choose your preferred scheduling platform to book a consultation call.
                </p>
                <div class="schedule-options">
                    <button class="btn btn-primary schedule-option" data-platform="calendly">
                        <i class="fas fa-calendar"></i>
                        Calendly
                    </button>
                    <button class="btn btn-secondary schedule-option" data-platform="email">
                        <i class="fas fa-envelope"></i>
                        Email Request
                    </button>
                </div>
                <button class="btn btn-ghost modal-close">
                    <i class="fas fa-times"></i>
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Event listeners for the modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeSchedulingModal(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeSchedulingModal(modal);
            }
        });

        modal.querySelectorAll('.schedule-option').forEach(option => {
            option.addEventListener('click', () => {
                const platform = option.dataset.platform;
                this.handleSchedulingPlatform(platform);
                this.closeSchedulingModal(modal);
            });
        });
    }

    closeSchedulingModal(modal) {
        gsap.to(modal.querySelector('.modal-content'), {
            scale: 0.9,
            opacity: 0,
            y: 50,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
    }

    handleSchedulingPlatform(platform) {
        if (platform === 'calendly') {
            // Open Calendly link (replace with your actual Calendly URL)
            window.open('https://calendly.com/yasmine-cherif', '_blank');
        } else if (platform === 'email') {
            // Pre-fill contact form or open email client
            const subject = encodeURIComponent('Schedule a Consultation Call');
            const body = encodeURIComponent('Hi Yasmine,\n\nI would like to schedule a consultation call to discuss my project. Please let me know your availability.\n\nBest regards,');
            window.location.href = `mailto:yasmine.cherif@example.com?subject=${subject}&body=${body}`;
        }

        // Analytics
        if (window.gtag) {
            gtag('event', 'schedule_call_click', {
                event_category: 'Contact',
                event_label: platform
            });
        }
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    // Initialize main controller
    const contactController = new ContactPageController();
    
    // Initialize additional controllers
    const analyticsController = new ContactAnalytics();
    const scheduleController = new ScheduleCallController();
    
    // Set up global references
    window.contactPageController = contactController;
    
    // Initialize theme controller if not present
    if (!window.themeController) {
        window.themeController = new ThemeController();
    }
    
    // Show success notification
    // Utils.showNotification('Contact page loaded successfully!', 'success');
});

// ===== CONTACT FORM ENHANCEMENT =====

// Auto-save form data to localStorage
class ContactFormAutoSave {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.storageKey = 'contact-form-draft';
        
        if (this.form) {
            this.initialize();
        }
    }

    initialize() {
        this.loadDraft();
        this.setupAutoSave();
        this.setupDraftNotification();
    }

    loadDraft() {
        const draft = localStorage.getItem(this.storageKey);
        if (draft) {
            const data = JSON.parse(draft);
            Object.keys(data).forEach(key => {
                const field = this.form.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = data[key];
                    } else {
                        field.value = data[key];
                    }
                }
            });

            // Show draft notification
            this.showDraftNotification();
        }
    }

    setupAutoSave() {
        const fields = this.form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.addEventListener('input', Utils.debounce(() => {
                this.saveDraft();
            }, 1000));
        });
    }

    saveDraft() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field && field.type === 'checkbox') {
                data[key] = field.checked;
            } else {
                data[key] = value;
            }
        }

        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    clearDraft() {
        localStorage.removeItem(this.storageKey);
        this.hideDraftNotification();
    }

    setupDraftNotification() {
        // Clear draft when form is submitted successfully
        this.form.addEventListener('submit', () => {
            setTimeout(() => {
                this.clearDraft();
            }, 2000); // Clear after successful submission
        });
    }

    showDraftNotification() {
        const notification = document.createElement('div');
        notification.className = 'draft-notification';
        notification.innerHTML = `
            <div class="draft-content">
                <i class="fas fa-save"></i>
                <span>Draft restored from previous session</span>
                <button class="draft-clear" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        this.form.insertBefore(notification, this.form.firstChild);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    hideDraftNotification() {
        const notification = document.querySelector('.draft-notification');
        if (notification) {
            notification.remove();
        }
    }
}

// Initialize auto-save when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormAutoSave();
});