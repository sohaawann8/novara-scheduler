import type { PlannedEvent } from '../store/useNovara';
import { format } from 'date-fns';

/**
 * Convert a JavaScript Date to ICS format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

/**
 * Escape special characters for ICS content
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')    // Escape backslashes
    .replace(/;/g, '\\;')      // Escape semicolons
    .replace(/,/g, '\\,')      // Escape commas
    .replace(/\n/g, '\\n')     // Escape newlines
    .replace(/\r/g, '');       // Remove carriage returns
}

/**
 * Fold long lines according to ICS specification (75 characters max)
 */
function foldLine(line: string): string {
  if (line.length <= 75) {
    return line;
  }

  const folded: string[] = [];
  let remaining = line;

  // First line can be 75 characters
  folded.push(remaining.substring(0, 75));
  remaining = remaining.substring(75);

  // Subsequent lines should be 74 characters (account for leading space)
  while (remaining.length > 74) {
    folded.push(' ' + remaining.substring(0, 74));
    remaining = remaining.substring(74);
  }

  if (remaining.length > 0) {
    folded.push(' ' + remaining);
  }

  return folded.join('\r\n');
}

/**
 * Generate a unique UID for an event
 */
function generateUID(event: PlannedEvent): string {
  // Use goal ID and start time to create a deterministic UID
  const timestamp = new Date(event.start).getTime();
  return `${event.goalId}-${timestamp}@novara-scheduler.app`;
}

/**
 * Generate attendee list for ICS
 */
function generateAttendees(memberIds: string[], members: Array<{ id: string; name: string; email: string }>): string[] {
  return memberIds
    .map(id => {
      const member = members.find(m => m.id === id);
      if (!member) return null;

      const name = escapeICSText(member.name);
      const email = member.email;

      return foldLine(`ATTENDEE;CN="${name}";RSVP=TRUE:mailto:${email}`);
    })
    .filter(Boolean) as string[];
}

/**
 * Generate ICS content for a single event
 */
function generateEventICS(
  event: PlannedEvent,
  members: Array<{ id: string; name: string; email: string }>
): string[] {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const now = new Date();

  const lines: string[] = [];

  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${generateUID(event)}`);
  lines.push(`DTSTAMP:${formatICSDate(now)}`);
  lines.push(`DTSTART:${formatICSDate(startDate)}`);
  lines.push(`DTEND:${formatICSDate(endDate)}`);
  lines.push(foldLine(`SUMMARY:${escapeICSText(event.title)}`));

  if (event.notes) {
    lines.push(foldLine(`DESCRIPTION:${escapeICSText(event.notes)}`));
  }

  if (event.location) {
    lines.push(foldLine(`LOCATION:${escapeICSText(event.location)}`));
  }

  // Add attendees
  const attendees = generateAttendees(event.memberIds, members);
  lines.push(...attendees);

  lines.push('STATUS:CONFIRMED');
  lines.push('TRANSP:OPAQUE');
  lines.push('END:VEVENT');

  return lines;
}

/**
 * Generate complete ICS file content
 */
export function generateICS(
  events: PlannedEvent[],
  members: Array<{ id: string; name: string; email: string }>
): string {
  const lines: string[] = [];

  // ICS header
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Novara Scheduler//Novara Auto-Scheduler//EN');
  lines.push('METHOD:PUBLISH');
  lines.push('CALSCALE:GREGORIAN');

  // Add events
  for (const event of events) {
    const eventLines = generateEventICS(event, members);
    lines.push(...eventLines);
  }

  // ICS footer
  lines.push('END:VCALENDAR');

  // Join with CRLF as per ICS specification
  return lines.join('\r\n') + '\r\n';
}

/**
 * Download ICS file to user's device
 */
export function downloadICS(
  events: PlannedEvent[],
  members: Array<{ id: string; name: string; email: string }>,
  filename = 'novara-invites.ics'
): void {
  const icsContent = generateICS(events, members);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate ICS content (basic validation)
 */
export function validateICS(icsContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!icsContent.includes('BEGIN:VCALENDAR')) {
    errors.push('Missing VCALENDAR begin tag');
  }

  if (!icsContent.includes('END:VCALENDAR')) {
    errors.push('Missing VCALENDAR end tag');
  }

  if (!icsContent.includes('VERSION:2.0')) {
    errors.push('Missing or invalid VERSION');
  }

  const eventBegins = (icsContent.match(/BEGIN:VEVENT/g) || []).length;
  const eventEnds = (icsContent.match(/END:VEVENT/g) || []).length;

  if (eventBegins !== eventEnds) {
    errors.push('Mismatched VEVENT begin/end tags');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
