/**
 * Component Loader - Memuat komponen HTML eksternal
 */

class ComponentLoader {
    constructor() {
      this.cache = new Map();
    }
  
    /**
     * Load komponen dari file HTML
     * @param {string} componentPath - Path ke file komponen
     * @returns {Promise<string>} - HTML content
     */
    async loadComponent(componentPath) {
      // Cek cache dulu
      if (this.cache.has(componentPath)) {
        return this.cache.get(componentPath);
      }
  
      try {
        const response = await fetch(componentPath);
        if (!response.ok) {
          throw new Error(`Failed to load component: ${componentPath}`);
        }
        
        const html = await response.text();
        this.cache.set(componentPath, html);
        return html;
      } catch (error) {
        console.error('Component load error:', error);
        return '';
      }
    }
  
    /**
     * Inject komponen ke selector tertentu
     * @param {string} selector - CSS selector target
     * @param {string} componentPath - Path ke komponen
     */
    async injectComponent(selector, componentPath) {
      const element = document.querySelector(selector);
      if (!element) {
        console.warn(`Element not found: ${selector}`);
        return;
      }
  
      const html = await this.loadComponent(componentPath);
      element.innerHTML = html;
  
      // Trigger event untuk inisialisasi komponen
      element.dispatchEvent(new CustomEvent('component-loaded', {
        detail: { path: componentPath }
      }));
    }
  
    /**
     * Load semua komponen pada halaman
     */
    async loadAllComponents() {
      const components = [
        { selector: 'header', path: '/components/header.html' },
        { selector: 'footer', path: '/components/footer.html' }
      ];
  
      await Promise.all(
        components.map(({ selector, path }) => 
          this.injectComponent(selector, path)
        )
      );
  
      // Initialize komponen setelah load
      this.initializeComponents();
    }
  
    /**
     * Initialize interactive components
     */
    initializeComponents() {
      // Mobile menu toggle
      const mobileToggle = document.getElementById('mobile-menu-toggle');
      const mobileMenu = document.getElementById('mobile-menu');
  
      if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
          mobileMenu.classList.toggle('hidden');
        });
      }
  
      // Active nav highlighting
      this.highlightActiveNav();
    }
  
    /**
     * Highlight active navigation link
     */
    highlightActiveNav() {
      const currentPath = window.location.pathname;
      const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  
      navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
          link.classList.add('text-red-primary', 'font-bold');
        }
      });
    }
  }
  
  // Export singleton instance
  const componentLoader = new ComponentLoader();
  export default componentLoader;