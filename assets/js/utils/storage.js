/**
 * LocalStorage Manager dengan namespace dan versioning
 */

const STORAGE_PREFIX = 'nihongopedia';
const CURRENT_VERSION = 'v1';

class StorageManager {
  constructor() {
    this.prefix = `${STORAGE_PREFIX}_${CURRENT_VERSION}`;
  }

  /**
   * Generate storage key dengan namespace
   */
  getKey(key) {
    return `${this.prefix}_${key}`;
  }

  /**
   * Set data ke localStorage
   */
  set(key, value) {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        version: CURRENT_VERSION
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  /**
   * Get data dari localStorage
   */
  get(key) {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const data = JSON.parse(item);
      
      // Validasi versi
      if (data.version !== CURRENT_VERSION) {
        this.remove(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  /**
   * Remove data dari localStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  /**
   * Clear semua data Nihongopedia
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Cek apakah data expired (default 7 hari)
   */
  isExpired(key, maxAge = 7 * 24 * 60 * 60 * 1000) {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return true;

      const data = JSON.parse(item);
      return Date.now() - data.timestamp > maxAge;
    } catch (error) {
      return true;
    }
  }
}

export default new StorageManager();