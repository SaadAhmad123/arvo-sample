'use client';

import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ThemeMode, MaterialThemeBuilder } from '@repo/utilities';

export const updateColorStyles = (color: string, mode: ThemeMode) => {
  const root = document.body;
  for (const [key, value] of Object.entries(
    new MaterialThemeBuilder({ source: 'color', color: color }).createThemeCssVariables(mode),
  )) {
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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [selectedTab, setSelectedTab] = useState('Preset');

  useEffect(() => {
    updateColorStyles(selectedColor, 'dark');
  }, [selectedColor]);

  const tabs = ['Preset', 'Custom'];

  return (
    <div className='fixed bottom-6 right-6'>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, bounce: 0.3 }}
            className='absolute bottom-16 right-0 bg-surface-container-lowest text-on-surface rounded-lg p-4 shadow-lg w-64 font-sans'
          >
            <div className='relative'>
              <div className='flex border-b border-secondary mb-4'>
                {tabs.map((tab) => (
                  <button
                    type='button'
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={'relative px-4 py-2 text-sm flex-1'}
                  >
                    {tab}
                    {selectedTab === tab && (
                      <motion.div
                        layoutId='underline'
                        className='absolute bottom-0 left-0 right-0 h-0.5 bg-secondary'
                        transition={{ type: 'spring', bounce: 0.3, duration: 0.3 }}
                      />
                    )}
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
                    transition={{ duration: 0.2, bounce: 0.3 }}
                  >
                    <div className='grid grid-cols-5 gap-2'>
                      {PRESET_COLORS.map((color) => (
                        <button
                          type='button'
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className='w-8 h-8 rounded-full relative'
                          style={{ backgroundColor: color }}
                        >
                          {selectedColor === color && (
                            <motion.div
                              layoutId='selectedRing'
                              className='absolute inset-0 rounded-full border-2 border-scrim'
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key='custom'
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, bounce: 0.3 }}
                  >
                    <input
                      type='color'
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className='w-full h-32 rounded-md cursor-pointer'
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className='mt-4 bg-surface-container-low text-on-surface text-center p-1 rounded'>{selectedColor}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className='w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 bg-primary text-on-primary'
        onClick={() => setIsOpen(!isOpen)}
      >
        <Palette className='text-on-primary' size={24} />
      </motion.button>
    </div>
  );
};
