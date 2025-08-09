import type { Member, AvailabilityWindow, Goal, PlannedEvent, Vibe } from '../store/useNovara';
import { getUpcomingWeeks, formatDateTime, generateId } from './time';
import { addDays, addHours, format } from 'date-fns';

interface PlanRequest {
  members: Member[];
  availability: AvailabilityWindow[];
  goals: Goal[];
  vibe: Vibe;
}

interface PlanResponse {
  plans: PlannedEvent[];
}

interface ApplyRequest {
  plans: PlannedEvent[];
}

interface ApplyResponse {
  created: Array<{ goalId: string; eventId: string }>;
  updated: Array<{ goalId: string; eventId: string }>;
}

class MockApiService {
  private generateVibeAwareContent(vibe: Vibe, goalType: string): { title: string; notes: string } {
    const vibeContent = {
      cozy: {
        date_night: {
          title: '🥰 Date Night',
          notes: 'Time to reconnect and enjoy each other\'s company. Maybe try that new restaurant or have a cozy night in!'
        },
        one_on_one: {
          title: '☕ Catch-up Time',
          notes: 'One-on-one time to chat, share updates, and strengthen your bond.'
        },
        two_friends: {
          title: '👫 Friend Hangout',
          notes: 'Quality time with friends - maybe grab coffee, go for a walk, or just chill together.'
        },
        run_walk: {
          title: '🚶 Morning Walk',
          notes: 'A peaceful walk to start the day right and get some fresh air together.'
        }
      },
      hype: {
        date_night: {
          title: '🔥 Epic Date Night',
          notes: 'Let\'s make this night unforgettable! Time to explore, adventure, and create amazing memories!'
        },
        one_on_one: {
          title: '⚡ Power Session',
          notes: 'High-energy one-on-one time to sync up, brainstorm, and tackle big ideas together!'
        },
        two_friends: {
          title: '🎉 Squad Time',
          notes: 'Time to get the crew together and make some noise! Adventure awaits!'
        },
        run_walk: {
          title: '🏃 Power Run',
          notes: 'Time to crush those fitness goals! Let\'s get our heart rates up and conquer the day!'
        }
      },
      professional: {
        date_night: {
          title: 'Scheduled Quality Time',
          notes: 'Dedicated time for relationship maintenance and meaningful conversation.'
        },
        one_on_one: {
          title: 'Individual Meeting',
          notes: 'Focused one-on-one session for alignment, feedback, and personal development.'
        },
        two_friends: {
          title: 'Group Session',
          notes: 'Structured social interaction to maintain and strengthen professional relationships.'
        },
        run_walk: {
          title: 'Wellness Activity',
          notes: 'Scheduled physical activity to promote health and team building.'
        }
      }
    };

    return vibeContent[vibe][goalType as keyof typeof vibeContent[typeof vibe]] || {
      title: 'Scheduled Event',
      notes: 'Time blocked for this important activity.'
    };
  }

  private generateMockPlans(request: PlanRequest): PlannedEvent[] {
    const { members, availability, goals, vibe } = request;
    const plans: PlannedEvent[] = [];
    const upcomingWeeks = getUpcomingWeeks(2);

    // Simple deterministic scheduling algorithm for demo
    goals.forEach((goal, goalIndex) => {
      const { title, notes } = this.generateVibeAwareContent(vibe, goal.type);

      // Find a suitable slot for this goal
      const participantMembers = members.filter(m => goal.participants.includes(m.id));

      if (participantMembers.length === 0) return;

      // Try to find a slot where all participants are available
      for (let dayOffset = goalIndex * 2; dayOffset < upcomingWeeks.length; dayOffset += 7) {
        const targetDate = upcomingWeeks[dayOffset];
        const dayOfWeek = targetDate.getDay();

        // Convert Sunday=0 to our format where Monday=1, Sunday=0
        const adjustedDay = dayOfWeek === 0 ? 0 : dayOfWeek;

        // Find common availability
        const commonSlots = this.findCommonAvailability(
          adjustedDay,
          goal.participants,
          availability,
          goal.durationMins
        );

        if (commonSlots.length > 0) {
          const slot = commonSlots[0];
          const startDateTime = new Date(targetDate);
          const [startHour, startMin] = slot.split(':').map(Number);
          startDateTime.setHours(startHour, startMin, 0, 0);

          const endDateTime = new Date(startDateTime);
          endDateTime.setMinutes(endDateTime.getMinutes() + goal.durationMins);

          plans.push({
            goalId: goal.id,
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString(),
            memberIds: goal.participants,
            title,
            notes,
            location: goal.locationHint
          });
          break;
        }
      }
    });

    return plans;
  }

  private findCommonAvailability(
    day: number,
    participantIds: string[],
    availability: AvailabilityWindow[],
    durationMins: number
  ): string[] {
    // Get availability windows for all participants on this day
    const participantWindows = participantIds.map(id =>
      availability.filter(a => a.memberId === id && a.day === day)
    );

    // If any participant has no availability, return empty
    if (participantWindows.some(windows => windows.length === 0)) {
      return [];
    }

    // Find overlapping time slots
    const commonSlots: string[] = [];
    const timeSlots = this.generateTimeSlots('07:00', '22:00', 30);

    for (const slot of timeSlots) {
      const slotMinutes = this.timeToMinutes(slot);
      const endSlotMinutes = slotMinutes + durationMins;

      // Check if this slot works for all participants
      const worksForAll = participantWindows.every(windows =>
        windows.some(window => {
          const windowStart = this.timeToMinutes(window.start);
          const windowEnd = this.timeToMinutes(window.end);
          return slotMinutes >= windowStart && endSlotMinutes <= windowEnd;
        })
      );

      if (worksForAll) {
        commonSlots.push(slot);
      }
    }

    return commonSlots;
  }

  private generateTimeSlots(start: string, end: string, intervalMins: number): string[] {
    const slots: string[] = [];
    const startMins = this.timeToMinutes(start);
    const endMins = this.timeToMinutes(end);

    for (let mins = startMins; mins < endMins; mins += intervalMins) {
      const hours = Math.floor(mins / 60);
      const minutes = mins % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }

    return slots;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async plan(request: PlanRequest): Promise<PlanResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    const plans = this.generateMockPlans(request);
    return { plans };
  }

  async apply(request: ApplyRequest): Promise<ApplyResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));

    // Mock successful creation of all events
    const created = request.plans.map(plan => ({
      goalId: plan.goalId,
      eventId: generateId()
    }));

    return { created, updated: [] };
  }

  async shuffle(goalId: string, cursor?: string): Promise<PlanResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 200));

    // For demo purposes, return a shuffled time for the same goal
    // In a real implementation, this would get alternative slots
    return { plans: [] }; // Simplified for mock
  }
}

class RealApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async plan(request: PlanRequest): Promise<PlanResponse> {
    const response = await fetch(`${this.baseUrl}/plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Plan request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async apply(request: ApplyRequest): Promise<ApplyResponse> {
    const response = await fetch(`${this.baseUrl}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Apply request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async shuffle(goalId: string, cursor?: string): Promise<PlanResponse> {
    const url = new URL(`${this.baseUrl}/plan`);
    url.searchParams.set('goalId', goalId);
    if (cursor) {
      url.searchParams.set('cursor', cursor);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Shuffle request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// Export the appropriate service based on environment
const API_BASE = import.meta.env.VITE_API_BASE;

export const apiService = API_BASE
  ? new RealApiService(API_BASE)
  : new MockApiService();

// Export types
export type { PlanRequest, PlanResponse, ApplyRequest, ApplyResponse };
