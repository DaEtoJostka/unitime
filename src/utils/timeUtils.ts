import { TimeSlot } from '../types/timeSlots';

/**
 * Converts time string (HH:MM) to total minutes
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Checks if current time is within a time slot
 */
export const isCurrentTimeSlot = (timeSlot: TimeSlot): boolean => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = timeToMinutes(timeSlot.startTime);
  const endMinutes = timeToMinutes(timeSlot.endTime);
  
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

/**
 * Checks if current time is in break between two time slots
 * Returns the time left until next slot starts
 */
export const checkIfInBreak = (
  currentSlot: TimeSlot,
  nextSlot: TimeSlot
): { timeLeft: number } | null => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const endMinutes = timeToMinutes(currentSlot.endTime);
  const nextStartMinutes = timeToMinutes(nextSlot.startTime);
  
  if (currentMinutes >= endMinutes && currentMinutes < nextStartMinutes) {
    return { timeLeft: nextStartMinutes - currentMinutes };
  }
  
  return null;
};

/**
 * Gets the plural form of "minutes" in Russian
 */
export const getMinutesLabel = (count: number): string => {
  if (count === 1) return 'минута';
  if (count > 1 && count < 5) return 'минуты';
  return 'минут';
};

