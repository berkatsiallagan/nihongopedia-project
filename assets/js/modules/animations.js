/**
 * Animations Module
 * Mengelola animasi menggunakan GSAP
 */

class Animations {
    constructor() {
      this.gsapLoaded = false;
    }
  
    init() {
      // Check if GSAP loaded
      if (typeof gsap === 'undefined') {
        console.warn('⚠️ GSAP not loaded, animations disabled');
        return;
      }
  
      this.gsapLoaded = true;
  
      // Animate hero section
      this.animateHero();
  
      // Observe elements for scroll animations
      this.observeElements();
  
      console.log('✨ Animations initialized');
    }
  
    animateHero() {
      if (!this.gsapLoaded) return;
  
      const heroTitle = document.getElementById('hero-title');
      if (!heroTitle) return;
  
      gsap.from(heroTitle.children, {
        duration: 1,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }
  
    animateCards() {
      if (!this.gsapLoaded) return;
  
      const cards = document.querySelectorAll('.card-interactive');
      
      gsap.from(cards, {
        duration: 0.6,
        y: 30,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }
  
    observeElements() {
      if (!this.gsapLoaded) return;
  
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.to(entry.target, {
              duration: 0.8,
              y: 0,
              opacity: 1,
              ease: 'power2.out'
            });
            
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      });
  
      // Observe sections
      document.querySelectorAll('section').forEach(section => {
        gsap.set(section, { y: 30, opacity: 0 });
        observer.observe(section);
      });
    }
  
    fadeIn(element, duration = 0.5) {
      if (!this.gsapLoaded) {
        element.style.opacity = '1';
        return;
      }
  
      gsap.to(element, {
        duration,
        opacity: 1,
        ease: 'power2.out'
      });
    }
  
    fadeOut(element, duration = 0.5) {
      if (!this.gsapLoaded) {
        element.style.opacity = '0';
        return;
      }
  
      gsap.to(element, {
        duration,
        opacity: 0,
        ease: 'power2.out'
      });
    }
  
    slideUp(element, duration = 0.6) {
      if (!this.gsapLoaded) return;
  
      gsap.from(element, {
        duration,
        y: 50,
        opacity: 0,
        ease: 'power3.out'
      });
    }
  
    pulse(element) {
      if (!this.gsapLoaded) return;
  
      gsap.to(element, {
        scale: 1.05,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
  }
  
  export default new Animations();