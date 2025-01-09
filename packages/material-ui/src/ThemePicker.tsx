'use client';

import { useEffect, useState } from 'react';
import { Palette, Sun, Moon, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ThemeMode, MaterialThemeBuilder } from './utils';
import { FAB } from './FAB';

const STORAGE_KEY = 'theme-preferences';
const DEFAULT_PREFERENCES = {
  color: '#bbb7be',
  mode: 'dark' as ThemeMode,
};

// Helper to safely interact with localStorage in a client-side context
const storage = {
  get: () => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as typeof DEFAULT_PREFERENCES;
    } catch {
      return null;
    }
  },
  set: (value: typeof DEFAULT_PREFERENCES) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {}
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};

const updateColorStyles = (color: string, mode: ThemeMode) => {
  if (typeof document === 'undefined') return;
  const root = document.body;
  const cssVars = new MaterialThemeBuilder({ source: 'color', color }).createThemeCssVariables(mode);
  for (const [key, value] of Object.entries(cssVars)) {
    root.style.setProperty(key, value);
  }
};

const PRESET_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEEAD',
  '#D4A5A5',
  '#9B59B6',
  '#3498DB',
  '#E74C3C',
  '#2ECC71',
  '#F1C40F',
  '#1ABC9C',
  '#34495E',
  '#7F8C8D',
  '#95A5A6',
];

export const ThemePicker = () => {
  const tabs = ['Preset', 'Custom', 'Mode'] as const;
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]>('Mode');
  const [preferences, setPreferences] = useState<typeof DEFAULT_PREFERENCES>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Initialize preferences and apply theme
    const stored = storage.get();
    if (stored) {
      setPreferences(stored);
      updateColorStyles(stored.color, stored.mode);
    } else {
      updateColorStyles(DEFAULT_PREFERENCES.color, DEFAULT_PREFERENCES.mode);
    }
    setMounted(true);
  }, []);

  // Handle preferences updates
  const updatePreferences = (updates: Partial<typeof DEFAULT_PREFERENCES>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    storage.set(newPreferences);
    updateColorStyles(newPreferences.color, newPreferences.mode);
  };

  // Reset preferences to default
  const resetPreferences = () => {
    storage.clear();
    setSelectedTab('Mode');
    setPreferences(DEFAULT_PREFERENCES);
    updateColorStyles(DEFAULT_PREFERENCES.color, DEFAULT_PREFERENCES.mode);
  };

  if (!mounted) return null;

  return (
    <div className='fixed bottom-6 right-6'>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, bounce: 0.3 }}
            className='absolute bottom-16 xl:bottom-28 right-0 bg-surface-container-high text-on-surface rounded-3xl p-4 shadow-elevation-2 hover:shadow-elevation-3 w-72 font-sans transition-shadow duration-200'
          >
            <div className='relative'>
              <div className='flex rounded-full bg-surface-container-low mb-4 p-1'>
                {tabs.map((tab) => (
                  <button
                    type='button'
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`relative px-4 py-2 text-sm flex-1 rounded-full transition-colors duration-200 ${
                      selectedTab === tab
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'hover:bg-surface-container-highest text-on-surface'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode='wait'>
                {selectedTab === 'Preset' ? (
                  <motion.div
                    key='preset'
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className='bg-surface-container-low rounded-2xl p-3'
                  >
                    <div className='grid grid-cols-5 gap-2'>
                      {PRESET_COLORS.map((color) => (
                        <button
                          type='button'
                          key={color}
                          onClick={() => updatePreferences({ color })}
                          className='w-8 h-8 rounded-full relative hover:scale-110 transition-transform duration-200'
                          style={{ backgroundColor: color }}
                        >
                          {preferences.color === color && (
                            <motion.div
                              layoutId='selectedRing'
                              className='absolute inset-0 rounded-full border-2 border-outline'
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : selectedTab === 'Custom' ? (
                  <motion.div
                    key='custom'
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className='bg-surface-container-low rounded-2xl p-3'
                  >
                    <input
                      type='color'
                      value={preferences.color}
                      onChange={(e) => updatePreferences({ color: e.target.value })}
                      className='w-full h-32 rounded-xl cursor-pointer'
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key='mode'
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className='bg-surface-container-low rounded-2xl p-3'
                  >
                    <div className='flex justify-center gap-4'>
                      {[
                        { mode: 'light' as const, Icon: Sun },
                        { mode: 'dark' as const, Icon: Moon },
                      ].map(({ mode, Icon }) => (
                        <button
                          key={mode}
                          type='button'
                          onClick={() => updatePreferences({ mode })}
                          className={`p-3 rounded-full transition-all duration-200 hover:scale-110 ${
                            preferences.mode === mode
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-highest/80'
                          }`}
                        >
                          <Icon size={24} />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className='mt-4 flex items-center justify-between gap-2'>
                <button
                  type='button'
                  onClick={resetPreferences}
                  className='p-3 rounded-full text-on-surface bg-surface-container-low active:scale-90 transition-colors duration-200 flex items-center justify-center'
                  title='Reset to default'
                >
                  <RotateCcw
                    size={20}
                    className='text-on-surface-variant group-hover:text-primary transition-colors duration-200'
                  />
                </button>
                <p className='flex-1 text-center bg-surface-container-low p-2 rounded-xl text-on-surface'>
                  {preferences.color}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FAB onClick={() => setIsOpen(!isOpen)} className='hidden xl:flex' size='large'>
        <Palette className='text-on-primary' size={36} />
      </FAB>

      <FAB onClick={() => setIsOpen(!isOpen)} className='flex xl:hidden'>
        <Palette className='text-on-primary' size={24} />
      </FAB>
    </div>
  );
};
