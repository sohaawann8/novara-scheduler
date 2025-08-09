import { format, parseISO, addMinutes, startOfWeek, addDays, isSameDay } from 'date-fns';
import { RRule } from 'rrule';

/**
 * Convert HH:MM time string to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to HH:MM time string
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Generate 30-minute time slots between start and end times
 */
export function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);

  for (let mins = startMins; mins < endMins; mins += 30) {
    slots.push(minutesToTime(mins));
  }

  return slots;
}

/**
 * Get all 30-minute slots for the week (07:00-22:00)
 */
export function getWeeklyTimeSlots(): string[] {
  return generateTimeSlots('07:00', '22:00');
}

/**
 * Get day names for the week starting from Monday
 */
export function getWeekDays(): string[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

/**
 * Get day numbers for the week (0=Sunday, 1=Monday, etc.)
 */
export function getWeekDayNumbers(): number[] {
  return [1, 2, 3, 4, 5, 6, 0]; // Monday=1 to Sunday=0
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return format(date, 'h:mm a');
}

/**
 * Format datetime for display
 */
export function formatDateTime(isoString: string): string {
  const date = parseISO(isoString);
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Convert RRULE to human-readable text
 */
export function humanizeRRule(rruleString: string): string {
  try {
    const rule = RRule.fromString(rruleString);
    return rule.toText();
  } catch (error) {
    return rruleString;
  }
}

/**
 * Get the current user's timezone
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get dates for the next N weeks starting from today
 */
export function getUpcomingWeeks(numWeeks = 2): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday

  for (let week = 0; week < numWeeks; week++) {
    for (let day = 0; day < 7; day++) {
      const date = addDays(startOfCurrentWeek, week * 7 + day);
      dates.push(date);
    }
  }

  return dates;
}

/**
 * Check if a time slot is available for a member on a specific day
 */
export function isSlotAvailable(
  day: number,
  time: string,
  availability: Array<{ day: number; start: string; end: string; memberId: string }>,
  memberId: string
): boolean {
  const memberAvailability = availability.filter(a => a.memberId === memberId && a.day === day);

  if (memberAvailability.length === 0) return false;

  const timeMinutes = timeToMinutes(time);

  return memberAvailability.some(window => {
    const startMinutes = timeToMinutes(window.start);
    const endMinutes = timeToMinutes(window.end);
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  });
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
