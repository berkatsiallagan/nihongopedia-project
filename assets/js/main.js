/**
 * Main JavaScript Entry Point
 * Mengatur inisialisasi komponen dan routing
 */

import componentLoader from './utils/component-loader.js';
import dataLoader from './modules/data-loader.js';
import router from './modules/router.js';
import animations from './modules/animations.js';

class NihongopediaApp {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Load komponen global (header, footer)
      await componentLoader.loadAllComponents();

      // Initialize animations
      animations.init();

      // Initialize router jika SPA page
      if (this.isSPAPage()) {
        router.init();
      }

      // Load categories pada homepage
      if (this.isHomePage()) {
        await this.loadHomeCategories();
      }

      // Load learning content pada learn page
      if (this.isLearnPage()) {
        await this.loadLearningContent();
      }

      this.initialized = true;
      console.log('✅ Nihongopedia initialized successfully');
    } catch (error) {
      console.error('❌ Initialization error:', error);
      this.showError();
    }
  }

  isSPAPage() {
    return window.location.pathname.includes('/pages/learn/');
  }

  isHomePage() {
    return window.location.pathname === '/' || window.location.pathname === '/index.html';
  }

  isLearnPage() {
    return window.location.pathname.includes('/pages/learn/');
  }

  async loadHomeCategories() {
    const grid = document.getElementById('categories-grid');
    const loader = document.getElementById('categories-loader');

    if (!grid || !loader) return;

    try {
      // Load metadata categories
      const categories = await dataLoader.loadCategories();

      // Hide loader, show grid
      loader.classList.add('hidden');
      grid.classList.remove('hidden');

      // Render categories
      grid.innerHTML = categories.map(cat => this.renderCategoryCard(cat)).join('');

      // Animate cards
      animations.animateCards();
    } catch (error) {
      console.error('Failed to load categories:', error);
      loader.innerHTML = '<p class="text-center text-gray-600">Gagal memuat kategori. Silakan refresh halaman.</p>';
    }
  }

  renderCategoryCard(category) {
    const icons = {
      greetings: '👋',
      farewells: '🙋',
      numbers: '🔢',
      time: '⏰',
      food: '🍱',
      travel: '✈️'
    };

    const icon = icons[category.slug] || '📚';

    return `
      <a href="/pages/learn/${category.slug}.html" class="card card-interactive group">
        <div class="flex items-start justify-between mb-4">
          <div class="text-5xl">${icon}</div>
          <span class="px-3 py-1 bg-red-50 text-red-primary text-sm rounded-full font-medium">
            ${category.itemCount || 0} materi
          </span>
        </div>
        <h3 class="text-2xl font-bold mb-2 text-gray-dark group-hover:text-red-primary transition-colors">
          ${category.title}
        </h3>
        <p class="text-gray-600 mb-4">${category.description}</p>
        <div class="flex items-center gap-2 text-red-primary font-medium">
          <span>Mulai Belajar</span>
          <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </a>
    `;
  }

  async loadLearningContent() {
    // Extract category dari URL
    const pathParts = window.location.pathname.split('/');
    const categorySlug = pathParts[pathParts.length - 1].replace('.html', '');

    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    try {
      // Show skeleton
      mainContent.innerHTML = '<div class="container mx-auto px-4 py-12" id="skeleton-loader"></div>';
      const loader = document.getElementById('skeleton-loader');
      loader.innerHTML = await componentLoader.loadComponent('/components/loader.html');

      // Load data
      const data = await dataLoader.loadCategoryData(categorySlug);

      // Render content
      const contentModule = await import('./modules/learning-content.js');
      contentModule.default.render(data, categorySlug);

    } catch (error) {
      console.error('Failed to load learning content:', error);
      mainContent.innerHTML = `
        <div class="container mx-auto px-4 py-20 text-center">
          <h2 class="text-3xl font-bold text-gray-dark mb-4">Kategori Tidak Ditemukan</h2>
          <p class="text-gray-600 mb-8">Materi yang Anda cari belum tersedia atau sedang dalam pengembangan.</p>
          <a href="/" class="btn btn-primary">Kembali ke Beranda</a>
        </div>
      `;
    }
  }

  showError() {
    document.body.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-white-secondary px-4">
        <div class="text-center max-w-md">
          <div class="text-6xl mb-6">😔</div>
          <h1 class="text-3xl font-bold text-gray-dark mb-4">Ups, Ada Masalah</h1>
          <p class="text-gray-600 mb-8">Terjadi kesalahan saat memuat aplikasi. Silakan refresh halaman.</p>
          <button onclick="location.reload()" class="btn btn-primary">
            Refresh Halaman
          </button>
        </div>
      </div>
    `;
  }
}

// Initialize app saat DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new NihongopediaApp();
    app.init();
  });
} else {
  const app = new NihongopediaApp();
  app.init();
}

// Export untuk debugging
window.NihongopediaApp = NihongopediaApp;