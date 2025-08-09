import { useState, useCallback, useRef } from 'react';
import { Calendar, Copy, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNovara, AvailabilityWindow, Member } from '../store/useNovara';
import { getWeeklyTimeSlots, getWeekDays, getWeekDayNumbers, generateId } from '../lib/time';

interface AvailabilityGridProps {
  className?: string;
}

interface DragState {
  isActive: boolean;
  startCell: { day: number; time: string } | null;
  isRemoving: boolean;
}

interface ClipboardData {
  day: number;
  slots: string[];
}

export function AvailabilityGrid({ className }: AvailabilityGridProps) {
  const { members, availability, setAvailability } = useNovara();
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [dragState, setDragState] = useState<DragState>({
    isActive: false,
    startCell: null,
    isRemoving: false
  });
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const timeSlots = getWeeklyTimeSlots();
  const weekDays = getWeekDays();
  const weekDayNumbers = getWeekDayNumbers();

  // Get availability for selected member
  const memberAvailability = availability.filter(a => a.memberId === selectedMember);

  // Check if a specific time slot is available for the selected member
  const isSlotAvailable = useCallback((day: number, time: string): boolean => {
    return memberAvailability.some(window => {
      if (window.day !== day) return false;
      const timeMinutes = timeToMinutes(time);
      const startMinutes = timeToMinutes(window.start);
      const endMinutes = timeToMinutes(window.end);
      return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    });
  }, [memberAvailability]);

  // Convert time string to minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to time string
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Get continuous availability windows for a day
  const getDayAvailability = useCallback((day: number): string[] => {
    const dayWindows = memberAvailability.filter(a => a.day === day);
    const availableSlots: string[] = [];

    for (const window of dayWindows) {
      const startMinutes = timeToMinutes(window.start);
      const endMinutes = timeToMinutes(window.end);

      for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
        availableSlots.push(minutesToTime(minutes));
      }
    }

    return availableSlots;
  }, [memberAvailability, timeToMinutes, minutesToTime]);

  // Handle mouse down on a cell
  const handleMouseDown = (day: number, time: string) => {
    if (!selectedMember) return;

    const isCurrentlyAvailable = isSlotAvailable(day, time);
    setDragState({
      isActive: true,
      startCell: { day, time },
      isRemoving: isCurrentlyAvailable
    });

    toggleSlot(day, time, !isCurrentlyAvailable);
  };

  // Handle mouse enter on a cell during drag
  const handleMouseEnter = (day: number, time: string) => {
    if (!dragState.isActive || !selectedMember) return;

    toggleSlot(day, time, !dragState.isRemoving);
  };

  // Handle mouse up to end drag
  const handleMouseUp = () => {
    setDragState({
      isActive: false,
      startCell: null,
      isRemoving: false
    });
  };

  // Toggle a time slot
  const toggleSlot = (day: number, time: string, makeAvailable: boolean) => {
    if (!selectedMember) return;

    const newAvailability = [...availability];

    // Remove existing availability windows for this member and day
    const filteredAvailability = newAvailability.filter(
      a => !(a.memberId === selectedMember && a.day === day)
    );

    if (makeAvailable) {
      // Add this slot and merge with adjacent slots
      const currentSlots = getDayAvailability(day);
      const timeMinutes = timeToMinutes(time);

      // Add the new slot
      const allSlots = [...currentSlots, time]
        .map(t => timeToMinutes(t))
        .sort((a, b) => a - b)
        .map(m => minutesToTime(m));

      // Remove duplicates
      const uniqueSlots = [...new Set(allSlots)];

      // Group consecutive slots into windows
      const windows = groupConsecutiveSlots(uniqueSlots);

      for (const window of windows) {
        filteredAvailability.push({
          id: generateId(),
          memberId: selectedMember,
          day,
          start: window.start,
          end: window.end
        });
      }
    } else {
      // Remove this slot
      const currentSlots = getDayAvailability(day).filter(t => t !== time);
      const windows = groupConsecutiveSlots(currentSlots);

      for (const window of windows) {
        filteredAvailability.push({
          id: generateId(),
          memberId: selectedMember,
          day,
          start: window.start,
          end: window.end
        });
      }
    }

    setAvailability(filteredAvailability);
  };

  // Group consecutive 30-minute slots into availability windows
  const groupConsecutiveSlots = (slots: string[]): Array<{ start: string; end: string }> => {
    if (slots.length === 0) return [];

    const sortedSlots = slots
      .map(timeToMinutes)
      .sort((a, b) => a - b);

    const windows: Array<{ start: string; end: string }> = [];
    let currentStart = sortedSlots[0];
    let currentEnd = sortedSlots[0] + 30;

    for (let i = 1; i < sortedSlots.length; i++) {
      const slotStart = sortedSlots[i];

      if (slotStart === currentEnd) {
        // Consecutive slot, extend current window
        currentEnd = slotStart + 30;
      } else {
        // Gap found, close current window and start new one
        windows.push({
          start: minutesToTime(currentStart),
          end: minutesToTime(currentEnd)
        });
        currentStart = slotStart;
        currentEnd = slotStart + 30;
      }
    }

    // Don't forget the last window
    windows.push({
      start: minutesToTime(currentStart),
      end: minutesToTime(currentEnd)
    });

    return windows;
  };

  // Copy day schedule to clipboard
  const copyDaySchedule = (day: number) => {
    const slots = getDayAvailability(day);
    setClipboard({ day, slots });
  };

  // Paste day schedule from clipboard
  const pasteDaySchedule = (targetDay: number) => {
    if (!clipboard || !selectedMember) return;

    const newAvailability = availability.filter(
      a => !(a.memberId === selectedMember && a.day === targetDay)
    );

    if (clipboard.slots.length > 0) {
      const windows = groupConsecutiveSlots(clipboard.slots);
      for (const window of windows) {
        newAvailability.push({
          id: generateId(),
          memberId: selectedMember,
          day: targetDay,
          start: window.start,
          end: window.end
        });
      }
    }

    setAvailability(newAvailability);
  };

  if (members.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Add team members first to set up availability
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekly Availability
        </CardTitle>
        <div>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger>
              <SelectValue placeholder="Select a member to edit availability" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedMember ? (
          <div className="text-center text-muted-foreground py-8">
            Select a member to edit their availability
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Click and drag to select available time slots. Copy/paste schedules between days.
            </div>

            <div
              ref={gridRef}
              className="grid grid-cols-8 gap-1 text-xs select-none"
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Header row */}
              <div className="p-2 font-medium text-center">Time</div>
              {weekDays.map((day, index) => (
                <div key={day} className="p-2 font-medium text-center">
                  <div>{day}</div>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyDaySchedule(weekDayNumbers[index])}
                      title="Copy day schedule"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => pasteDaySchedule(weekDayNumbers[index])}
                      disabled={!clipboard}
                      title="Paste day schedule"
                    >
                      <Clipboard className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Time slots */}
              {timeSlots.map((time) => (
                <div key={time} className="contents">
                  <div className="p-2 text-right text-muted-foreground border-r">
                    {time}
                  </div>
                  {weekDayNumbers.map((day) => {
                    const isAvailable = isSlotAvailable(day, time);
                    return (
                      <div
                        key={`${day}-${time}`}
                        className={`
                          p-1 border cursor-pointer transition-colors
                          ${isAvailable
                            ? 'bg-green-200 hover:bg-green-300 border-green-300'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                          }
                        `}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleMouseDown(day, time);
                        }}
                        onMouseEnter={() => handleMouseEnter(day, time)}
                      >
                        <div className="h-4 w-full" />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {clipboard && (
              <div className="text-xs text-muted-foreground">
                Copied schedule from {weekDays[weekDayNumbers.indexOf(clipboard.day)]} ({clipboard.slots.length} slots)
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
