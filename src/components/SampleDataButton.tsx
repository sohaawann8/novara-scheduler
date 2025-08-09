import { Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNovara, type Member, type AvailabilityWindow, type Goal } from '../store/useNovara';
import { generateId, getBrowserTimezone } from '../lib/time';

interface SampleDataButtonProps {
  className?: string;
}

export function SampleDataButton({ className }: SampleDataButtonProps) {
  const {
    setMembers,
    setAvailability,
    setGoals,
    setVibe,
    members,
    goals
  } = useNovara();

  const loadSampleData = () => {
    // Sample members - you, bf, and 4 friends
    const sampleMembers: Member[] = [
      {
        id: generateId(),
        name: 'Alex Chen',
        email: 'alex@example.com',
        tz: getBrowserTimezone(),
        home: '123 Main St, San Francisco, CA',
        office: '456 Tech Ave, San Francisco, CA'
      },
      {
        id: generateId(),
        name: 'Jordan Rivera',
        email: 'jordan@example.com',
        tz: getBrowserTimezone(),
        home: '789 Oak Dr, San Francisco, CA',
        office: '456 Tech Ave, San Francisco, CA'
      },
      {
        id: generateId(),
        name: 'Sam Wilson',
        email: 'sam@example.com',
        tz: 'America/Los_Angeles',
        home: '321 Pine St, Oakland, CA'
      },
      {
        id: generateId(),
        name: 'Taylor Kim',
        email: 'taylor@example.com',
        tz: 'America/Los_Angeles',
        home: '654 Elm Ave, Berkeley, CA'
      },
      {
        id: generateId(),
        name: 'Morgan Lee',
        email: 'morgan@example.com',
        tz: getBrowserTimezone(),
        home: '987 Cedar Ln, San Francisco, CA'
      },
      {
        id: generateId(),
        name: 'Casey Brown',
        email: 'casey@example.com',
        tz: 'America/Los_Angeles',
        home: '147 Birch St, Palo Alto, CA'
      }
    ];

    // Sample availability - typical work schedules with some variations
    const sampleAvailability: AvailabilityWindow[] = [];

    sampleMembers.forEach((member, memberIndex) => {
      // Weekday availability (Monday-Friday)
      for (let day = 1; day <= 5; day++) {
        // Morning availability (7:00-9:00 AM)
        sampleAvailability.push({
          id: generateId(),
          memberId: member.id,
          day,
          start: '07:00',
          end: '09:00',
          locationPref: 'either'
        });

        // Lunch break availability (12:00-13:30)
        if (memberIndex % 3 === 0) { // Not everyone has lunch availability
          sampleAvailability.push({
            id: generateId(),
            memberId: member.id,
            day,
            start: '12:00',
            end: '13:30',
            locationPref: 'office'
          });
        }

        // Evening availability (18:00-22:00)
        sampleAvailability.push({
          id: generateId(),
          memberId: member.id,
          day,
          start: '18:00',
          end: '22:00',
          locationPref: memberIndex % 2 === 0 ? 'home' : 'either'
        });
      }

      // Weekend availability (Saturday-Sunday)
      for (let day = 6; day <= 7; day++) {
        const adjustedDay = day === 7 ? 0 : day; // Convert Sunday to 0

        // Morning weekend availability (8:00-12:00)
        sampleAvailability.push({
          id: generateId(),
          memberId: member.id,
          day: adjustedDay,
          start: '08:00',
          end: '12:00',
          locationPref: 'either'
        });

        // Afternoon/evening weekend availability (14:00-21:00)
        sampleAvailability.push({
          id: generateId(),
          memberId: member.id,
          day: adjustedDay,
          start: '14:00',
          end: '21:00',
          locationPref: 'either'
        });
      }
    });

    // Sample goals - the 4 presets as mentioned in requirements
    const sampleGoals: Goal[] = [
      {
        id: generateId(),
        type: 'date_night',
        participants: [sampleMembers[0].id, sampleMembers[1].id], // Alex and Jordan
        durationMins: 90,
        rrule: 'FREQ=WEEKLY;BYDAY=FR,SA',
        locationHint: 'Nice restaurant or cozy home dinner',
        priority: 4
      },
      {
        id: generateId(),
        type: 'one_on_one',
        participants: [sampleMembers[0].id, sampleMembers[2].id], // Alex and Sam
        durationMins: 45,
        rrule: 'FREQ=WEEKLY;INTERVAL=1',
        locationHint: 'Coffee shop or quiet cafe',
        priority: 3
      },
      {
        id: generateId(),
        type: 'two_friends',
        participants: [sampleMembers[3].id, sampleMembers[4].id, sampleMembers[5].id], // Taylor, Morgan, Casey
        durationMins: 90,
        rrule: 'FREQ=WEEKLY;INTERVAL=2',
        locationHint: 'Park, brewery, or someone\'s place',
        priority: 2
      },
      {
        id: generateId(),
        type: 'run_walk',
        participants: [sampleMembers[0].id, sampleMembers[1].id, sampleMembers[2].id], // Alex, Jordan, Sam
        durationMins: 45,
        rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=7,8',
        locationHint: 'Golden Gate Park or neighborhood loop',
        priority: 3
      }
    ];

    // Load all the sample data
    setMembers(sampleMembers);
    setAvailability(sampleAvailability);
    setGoals(sampleGoals);
    setVibe('cozy');

    toast.success('Sample data loaded!', {
      description: `Added ${sampleMembers.length} members, availability schedules, and ${sampleGoals.length} goals`
    });
  };

  const hasExistingData = members.length > 0 || goals.length > 0;

  return (
    <Button
      variant={hasExistingData ? "outline" : "default"}
      onClick={loadSampleData}
      className={className}
    >
      <Database className="h-4 w-4 mr-2" />
      {hasExistingData ? 'Reset with Sample Data' : 'Load Sample Data'}
    </Button>
  );
}
