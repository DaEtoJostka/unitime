import { describe, it, expect } from 'vitest';
import { DEFAULT_TIME_SLOTS, TimeSlot } from './timeSlots';

describe('TimeSlots', () => {
  describe('DEFAULT_TIME_SLOTS', () => {
    it('should have 8 time slots', () => {
      expect(DEFAULT_TIME_SLOTS).toHaveLength(8);
    });

    it('should have correct structure for each time slot', () => {
      DEFAULT_TIME_SLOTS.forEach((slot) => {
        expect(slot).toHaveProperty('id');
        expect(slot).toHaveProperty('name');
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
        
        expect(typeof slot.id).toBe('number');
        expect(typeof slot.name).toBe('string');
        expect(typeof slot.startTime).toBe('string');
        expect(typeof slot.endTime).toBe('string');
      });
    });

    it('should have sequential IDs starting from 1', () => {
      DEFAULT_TIME_SLOTS.forEach((slot, index) => {
        expect(slot.id).toBe(index + 1);
      });
    });

    it('should have correct time format (HH:MM)', () => {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      
      DEFAULT_TIME_SLOTS.forEach((slot) => {
        expect(slot.startTime).toMatch(timeRegex);
        expect(slot.endTime).toMatch(timeRegex);
      });
    });

    it('should have correct first time slot', () => {
      expect(DEFAULT_TIME_SLOTS[0]).toEqual({
        id: 1,
        name: '1 пара',
        startTime: '08:30',
        endTime: '09:50',
      });
    });

    it('should have correct last time slot', () => {
      expect(DEFAULT_TIME_SLOTS[7]).toEqual({
        id: 8,
        name: '8 пара',
        startTime: '19:30',
        endTime: '20:50',
      });
    });

    it('should have end time after start time for each slot', () => {
      DEFAULT_TIME_SLOTS.forEach((slot) => {
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);
        
        const startTotal = startHour * 60 + startMinute;
        const endTotal = endHour * 60 + endMinute;
        
        expect(endTotal).toBeGreaterThan(startTotal);
      });
    });

    it('should have 80-minute duration for each slot', () => {
      DEFAULT_TIME_SLOTS.forEach((slot) => {
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);
        
        const startTotal = startHour * 60 + startMinute;
        const endTotal = endHour * 60 + endMinute;
        const duration = endTotal - startTotal;
        
        expect(duration).toBe(80);
      });
    });

    it('should have proper naming format', () => {
      DEFAULT_TIME_SLOTS.forEach((slot, index) => {
        expect(slot.name).toBe(`${index + 1} пара`);
      });
    });

    it('should be in chronological order', () => {
      for (let i = 0; i < DEFAULT_TIME_SLOTS.length - 1; i++) {
        const current = DEFAULT_TIME_SLOTS[i];
        const next = DEFAULT_TIME_SLOTS[i + 1];
        
        const [currentHour, currentMinute] = current.startTime.split(':').map(Number);
        const [nextHour, nextMinute] = next.startTime.split(':').map(Number);
        
        const currentTotal = currentHour * 60 + currentMinute;
        const nextTotal = nextHour * 60 + nextMinute;
        
        expect(nextTotal).toBeGreaterThan(currentTotal);
      }
    });
  });

  describe('TimeSlot interface', () => {
    it('should accept valid time slot objects', () => {
      const validSlot: TimeSlot = {
        id: 1,
        name: 'Test Slot',
        startTime: '10:00',
        endTime: '11:20',
      };

      expect(validSlot.id).toBe(1);
      expect(validSlot.name).toBe('Test Slot');
      expect(validSlot.startTime).toBe('10:00');
      expect(validSlot.endTime).toBe('11:20');
    });
  });

  describe('Break Times', () => {
    it('should have break between slot 3 and 4 (lunch break)', () => {
      const slot3 = DEFAULT_TIME_SLOTS[2]; // 11:30 - 12:50
      const slot4 = DEFAULT_TIME_SLOTS[3]; // 13:20 - 14:40
      
      expect(slot3.endTime).toBe('12:50');
      expect(slot4.startTime).toBe('13:20');
      
      // Calculate break duration
      const [endHour, endMinute] = slot3.endTime.split(':').map(Number);
      const [startHour, startMinute] = slot4.startTime.split(':').map(Number);
      
      const breakDuration = (startHour * 60 + startMinute) - (endHour * 60 + endMinute);
      expect(breakDuration).toBe(30); // 30 minute lunch break
    });

    it('should have 10-minute breaks between most slots', () => {
      const pairsWithTenMinuteBreaks = [
        [0, 1], // Between slot 1 and 2
        [1, 2], // Between slot 2 and 3
        [3, 4], // Between slot 4 and 5
        [4, 5], // Between slot 5 and 6
      ];

      pairsWithTenMinuteBreaks.forEach(([firstIdx, secondIdx]) => {
        const firstSlot = DEFAULT_TIME_SLOTS[firstIdx];
        const secondSlot = DEFAULT_TIME_SLOTS[secondIdx];
        
        const [endHour, endMinute] = firstSlot.endTime.split(':').map(Number);
        const [startHour, startMinute] = secondSlot.startTime.split(':').map(Number);
        
        const breakDuration = (startHour * 60 + startMinute) - (endHour * 60 + endMinute);
        expect(breakDuration).toBe(10);
      });
    });
  });
});

