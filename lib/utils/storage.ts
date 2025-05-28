/**
 * Utility functions for browser storage
 */

const PREFIX = 'leansight_';

/**
 * Save data to localStorage with prefix
 */
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined') {
      const serialized = JSON.stringify(data);
      localStorage.setItem(`${PREFIX}${key}`, serialized);
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Load data from localStorage with prefix
 */
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined') {
      const serialized = localStorage.getItem(`${PREFIX}${key}`);
      if (serialized === null) return defaultValue;
      return JSON.parse(serialized) as T;
    }
    return defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Remove data from localStorage with prefix
 */
export function removeFromLocalStorage(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${PREFIX}${key}`);
    }
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

/**
 * Save data to sessionStorage with prefix
 */
export function saveToSessionStorage<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined') {
      const serialized = JSON.stringify(data);
      sessionStorage.setItem(`${PREFIX}${key}`, serialized);
    }
  } catch (error) {
    console.error('Error saving to sessionStorage:', error);
  }
}

/**
 * Load data from sessionStorage with prefix
 */
export function loadFromSessionStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined') {
      const serialized = sessionStorage.getItem(`${PREFIX}${key}`);
      if (serialized === null) return defaultValue;
      return JSON.parse(serialized) as T;
    }
    return defaultValue;
  } catch (error) {
    console.error('Error loading from sessionStorage:', error);
    return defaultValue;
  }
}

/**
 * Remove data from sessionStorage with prefix
 */
export function removeFromSessionStorage(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`${PREFIX}${key}`);
    }
  } catch (error) {
    console.error('Error removing from sessionStorage:', error);
  }
}

/**
 * Create storage key based on user ID and form name
 */
export function createFormStorageKey(userId: string, formName: string, entityId?: string): string {
  return `form_${formName}_${userId}${entityId ? `_${entityId}` : ''}`;
}

/**
 * Create function to clear all draft data for a user
 */
export function clearAllDrafts(userId: string): void {
  try {
    if (typeof window !== 'undefined') {
      const formPrefix = `${PREFIX}form_`;
      const userFormPrefix = `${formPrefix}${userId}`;
      
      // Get all keys in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(userFormPrefix)) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error('Error clearing all drafts:', error);
  }
} 