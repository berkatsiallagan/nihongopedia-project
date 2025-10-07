/**
 * Data Loader Module
 * Mengelola loading dan caching data JSON
 */

import storage from '../utils/storage.js';

class DataLoader {
  constructor() {
    this.baseURL = '/data/categories';
    this.cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 hari
  }

  /**
   * Load daftar kategori dari metadata
   */
  async loadCategories() {
    const cacheKey = 'categories_meta';
    
    // Cek cache
    const cached = storage.get(cacheKey);
    if (cached && !storage.isExpired(cacheKey, this.cacheExpiry)) {
      console.log('📦 Loading categories from cache');
      return cached;
    }

    try {
      console.log('🌐 Fetching categories from server');
      const response = await fetch('/data/categories.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validasi data
      if (!Array.isArray(data)) {
        throw new Error('Invalid categories data format');
      }

      // Save to cache
      storage.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Failed to load categories:', error);
      
      // Return cached data jika ada, meski expired
      if (cached) {
        console.log('⚠️ Using expired cache as fallback');
        return cached;
      }
      
      // Return default categories sebagai fallback
      return this.getDefaultCategories();
    }
  }

  /**
   * Load data untuk kategori spesifik
   */
  async loadCategoryData(categorySlug) {
    const cacheKey = `category_${categorySlug}`;
    
    // Cek cache
    const cached = storage.get(cacheKey);
    if (cached && !storage.isExpired(cacheKey, this.cacheExpiry)) {
      console.log(`📦 Loading ${categorySlug} from cache`);
      return cached;
    }

    try {
      console.log(`🌐 Fetching ${categorySlug} from server`);
      const response = await fetch(`${this.baseURL}/${categorySlug}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validasi data
      this.validateCategoryData(data);

      // Sanitize data untuk keamanan
      const sanitized = this.sanitizeData(data);

      // Save to cache
      storage.set(cacheKey, sanitized);
      
      return sanitized;
    } catch (error) {
      console.error(`Failed to load category ${categorySlug}:`, error);
      
      // Return cached data jika ada, meski expired
      if (cached) {
        console.log('⚠️ Using expired cache as fallback');
        return cached;
      }
      
      throw error;
    }
  }

  /**
   * Validasi struktur data kategori
   */
  validateCategoryData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }

    const required = ['category', 'content_version', 'items'];
    for (const field of required) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(data.items)) {
      throw new Error('Items must be an array');
    }

    // Validasi setiap item
    data.items.forEach((item, index) => {
      const itemRequired = ['id', 'expression', 'reading', 'meaning_id'];
      for (const field of itemRequired) {
        if (!(field in item)) {
          throw new Error(`Item ${index}: Missing required field ${field}`);
        }
      }
    });
  }

  /**
   * Sanitize data untuk mencegah XSS
   */
  sanitizeData(data) {
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };

    const sanitizeItem = (item) => {
      const sanitized = {};
      
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(v => 
            typeof v === 'object' ? sanitizeItem(v) : sanitizeString(v)
          );
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeItem(value);
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    };

    return {
      ...data,
      items: data.items.map(item => sanitizeItem(item))
    };
  }

  /**
   * Default categories sebagai fallback
   */
  getDefaultCategories() {
    return [
      {
        slug: 'greetings',
        title: 'Salam & Sapaan',
        description: 'Pelajari berbagai cara menyapa dalam bahasa Jepang',
        itemCount: 20,
        level: 'beginner'
      },
      {
        slug: 'farewells',
        title: 'Perpisahan',
        description: 'Ungkapan perpisahan dalam berbagai situasi',
        itemCount: 15,
        level: 'beginner'
      }
    ];
  }

  /**
   * Preload kategori prioritas
   */
  async preloadCategories(categories) {
    const promises = categories.map(slug => 
      this.loadCategoryData(slug).catch(err => {
        console.warn(`Preload failed for ${slug}:`, err);
      })
    );

    await Promise.all(promises);
    console.log('✅ Priority categories preloaded');
  }

  /**
   * Clear cache untuk kategori tertentu atau semua
   */
  clearCache(categorySlug = null) {
    if (categorySlug) {
      storage.remove(`category_${categorySlug}`);
    } else {
      storage.clearAll();
    }
  }

  /**
   * Check if new version available
   */
  async checkVersion(categorySlug) {
    try {
      const response = await fetch(`${this.baseURL}/${categorySlug}.json`, {
        method: 'HEAD'
      });
      
      const lastModified = response.headers.get('Last-Modified');
      const cacheKey = `version_${categorySlug}`;
      const cachedVersion = storage.get(cacheKey);
      
      if (lastModified !== cachedVersion) {
        storage.set(cacheKey, lastModified);
        return true; // New version available
      }
      
      return false;
    } catch (error) {
      console.error('Version check failed:', error);
      return false;
    }
  }
}

export default new DataLoader();