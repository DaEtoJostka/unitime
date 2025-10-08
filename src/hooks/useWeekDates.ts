import { useState, useEffect } from 'react';

/**
 * Calculates the dates for the current week (Monday to Saturday)
 */
const calculateWeekDates = (): Date[] => {
  const today = new Date();
  const dates: Date[] = [];
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  
  // Find most recent Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  
  // Generate dates for Mon-Sat
  for (let i = 0; i < 6; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

/**
 * Hook to get week dates and update them weekly
 */
export const useWeekDates = () => {
  const [weekDates, setWeekDates] = useState<Date[]>(calculateWeekDates);

  useEffect(() => {
    // Update every Sunday at midnight
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(24, 0, 0, 0);
    
    const timeUntilSunday = nextSunday.getTime() - now.getTime();
    
    const timerId = setTimeout(() => {
      setWeekDates(calculateWeekDates());
      // Set weekly interval after first update
      const intervalId = setInterval(() => {
        setWeekDates(calculateWeekDates());
      }, 7 * 24 * 60 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }, timeUntilSunday);

    return () => clearTimeout(timerId);
  }, []);

  return weekDates;
};

