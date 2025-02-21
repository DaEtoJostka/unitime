export interface TimeSlot {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: 1, name: '1 пара', startTime: '08:30', endTime: '09:50' },
  { id: 2, name: '2 пара', startTime: '10:00', endTime: '11:20' },
  { id: 3, name: '3 пара', startTime: '11:30', endTime: '12:50' },
  { id: 4, name: '4 пара', startTime: '13:20', endTime: '14:40' },
  { id: 5, name: '5 пара', startTime: '14:50', endTime: '16:10' },
  { id: 6, name: '6 пара', startTime: '16:20', endTime: '17:40' },
  { id: 7, name: '7 пара', startTime: '18:00', endTime: '19:20' },
  { id: 8, name: '8 пара', startTime: '19:30', endTime: '20:50' }
]; 