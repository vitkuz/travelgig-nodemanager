import { useState, useEffect } from 'react';

/**
 * A hook for persisting state in localStorage
 * @param key The key to store the value under in localStorage
 * @param defaultValue The default value to use if no value exists in localStorage
 * @returns A tuple containing the current value and a function to update it
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return defaultValue
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      // If error also return defaultValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}