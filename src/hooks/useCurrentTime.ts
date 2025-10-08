import { useState, useEffect } from 'react';
import { TimeSlot, DEFAULT_TIME_SLOTS } from '../types/timeSlots';
import { checkIfInBreak } from '../utils/timeUtils';

interface BreakInfo {
  prevSlot: TimeSlot;
  nextSlot: TimeSlot;
  timeLeft: number;
}

/**
 * Hook to track current day index and break status
 */
export const useCurrentTime = () => {
  const [currentDayIndex, setCurrentDayIndex] = useState<number | null>(() => {
    const today = new Date().getDay();
    return today === 0 ? null : today - 1; // Adjust for week starting Monday
  });

  const [currentBreak, setCurrentBreak] = useState<BreakInfo | null>(null);

  // Update current day
  useEffect(() => {
    const updateCurrentDay = () => {
      const today = new Date().getDay();
      setCurrentDayIndex(today === 0 ? null : today - 1);
    };

    // Update at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timerId = setTimeout(() => {
      updateCurrentDay();
      const intervalId = setInterval(updateCurrentDay, 24 * 60 * 60 * 1000);
      return () => clearInterval(intervalId);
    }, timeUntilMidnight);

    return () => clearTimeout(timerId);
  }, []);

  // Update break status
  useEffect(() => {
    const updateBreakStatus = () => {
      for (let i = 0; i < DEFAULT_TIME_SLOTS.length - 1; i++) {
        const currentSlot = DEFAULT_TIME_SLOTS[i];
        const nextSlot = DEFAULT_TIME_SLOTS[i + 1];
        
        const breakInfo = checkIfInBreak(currentSlot, nextSlot);
        if (breakInfo) {
          setCurrentBreak({
            prevSlot: currentSlot,
            nextSlot: nextSlot,
            timeLeft: breakInfo.timeLeft
          });
          return;
        }
      }
      setCurrentBreak(null);
    };

    updateBreakStatus();
    const intervalId = setInterval(updateBreakStatus, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);

  return { currentDayIndex, currentBreak };
};

