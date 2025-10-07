/**
 * Router Module
 * Mengelola navigasi SPA tanpa reload
 */

class Router {
    constructor() {
      this.routes = new Map();
      this.currentRoute = null;
    }
  
    init() {
      // Handle popstate (browser back/forward)
      window.addEventListener('popstate', (e) => {
        this.handleRoute(window.location.pathname);
      });
  
      // Intercept link clicks
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        
        if (!link) return;
        
        // Only handle internal links
        if (link.hostname !== window.location.hostname) return;
        
        // Allow external behavior for certain links
        if (link.getAttribute('data-no-route')) return;
        
        // Check if SPA navigation
        if (this.shouldHandleRoute(link.pathname)) {
          e.preventDefault();
          this.navigate(link.pathname);
        }
      });
  
      console.log('🧭 Router initialized');
    }
  
    shouldHandleRoute(pathname) {
      // Only handle /pages/learn/ routes sebagai SPA
      return pathname.includes('/pages/learn/');
    }
  
    navigate(path, pushState = true) {
      if (pushState) {
        window.history.pushState({}, '', path);
      }
  
      this.handleRoute(path);
    }
  
    async handleRoute(path) {
      this.currentRoute = path;
  
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
  
      // Trigger route change event
      window.dispatchEvent(new CustomEvent('route-changed', {
        detail: { path }
      }));
    }
  
    register(path, handler) {
      this.routes.set(path, handler);
    }
  
    getCurrentRoute() {
      return this.currentRoute || window.location.pathname;
    }
  }
  
  export default new Router();