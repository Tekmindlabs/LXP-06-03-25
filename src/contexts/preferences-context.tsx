'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { UserPreferences } from '@/server/api/constants';

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    inApp: true,
    digest: 'daily',
  },
  display: {
    density: 'comfortable',
    fontSize: 'medium',
    colorScheme: 'default',
  },
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    screenReader: false,
    keyboardNavigation: false,
  },
};

// Local storage key
const PREFERENCES_STORAGE_KEY = 'aivy-user-preferences';

interface PreferencesContextType {
  preferences: UserPreferences;
  isLoading: boolean;
  error: Error | null;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse stored preferences:', e);
        }
      }
    }
    return defaultPreferences;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // API hooks with proper error boundaries
  const getPreferencesQuery = api.user.getPreferences.useQuery(undefined, {
    enabled: true, // Enable by default
    retry: 1,
    onError: (err) => {
      console.error('Failed to fetch preferences:', err);
      // Convert TRPC error to standard Error
      const error = new Error(err.message);
      setError(error);
      setIsLoading(false);
    },
    onSuccess: (data) => {
      if (data) {
        setPreferences(data);
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(data));
      }
      setIsLoading(false);
    }
  });
  
  const updatePreferencesMutation = api.user.updatePreferences.useMutation({
    onError: (err) => {
      console.error('Failed to update preferences:', err);
      // Convert TRPC error to standard Error
      const error = new Error(err.message);
      setError(error);
    },
    onSuccess: (data) => {
      if (data) {
        setPreferences(data);
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(data));
      }
    }
  });

  // Update preferences
  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      setIsLoading(true);
      
      // Merge with current preferences
      const updatedPreferences = {
        ...preferences,
        ...newPreferences,
        notifications: {
          ...preferences.notifications,
          ...(newPreferences.notifications || {}),
        },
        display: {
          ...preferences.display,
          ...(newPreferences.display || {}),
        },
        accessibility: {
          ...preferences.accessibility,
          ...(newPreferences.accessibility || {}),
        },
      };
      
      // Update local state immediately for responsive UI
      setPreferences(updatedPreferences);
      
      // Save to local storage as fallback
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updatedPreferences));
      
      // Update on server
      await updatePreferencesMutation.mutateAsync(updatedPreferences);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update preferences'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset preferences to defaults
  const resetPreferences = async () => {
    try {
      setIsLoading(true);
      
      // Update local state
      setPreferences(defaultPreferences);
      
      // Save to local storage
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(defaultPreferences));
      
      // Update on server
      await updatePreferencesMutation.mutateAsync(defaultPreferences);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reset preferences'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        isLoading,
        error,
        updatePreferences,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
} 