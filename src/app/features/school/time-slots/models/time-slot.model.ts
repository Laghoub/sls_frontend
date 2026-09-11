export interface TimeSlot {
  id: number;
  code: string;
  startTime: string;
  endTime: string;
  displayOrder: number;
  active: boolean;
}
export type TimeSlotRequest = Omit<TimeSlot, 'id'>;
