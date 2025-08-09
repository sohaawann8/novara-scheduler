import { useState, useCallback, useEffect } from 'react';
import { Rocket, Shuffle, Calendar, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNovara } from '../store/useNovara';
import { apiService } from '../lib/api';
import { downloadICS } from '../lib/ics';

interface ControlBarProps {
  className?: string;
}

export function ControlBar({ className }: ControlBarProps) {
  const {
    members,
    availability,
    goals,
    vibe,
    plans,
    loading,
    setPlans,
    setLoading,
    setError
  } = useNovara();

  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [planTimeout, setPlanTimeout] = useState<NodeJS.Timeout | null>(null);

  // Trigger planning when data changes with debouncing
  useEffect(() => {
    if (planTimeout) {
      clearTimeout(planTimeout);
    }

    const timeout = setTimeout(async () => {
      if (members.length === 0 || goals.length === 0) {
        setPlans([]);
        return;
      }

      try {
        setLoading(true);
        setError(undefined);

        const response = await apiService.plan({
          members,
          availability,
          goals,
          vibe
        });

        setPlans(response.plans);

        if (response.plans.length > 0) {
          toast.success(`Generated ${response.plans.length} event${response.plans.length === 1 ? '' : 's'}`);
        } else {
          toast.info('No suitable time slots found. Try adjusting availability or goals.');
        }
      } catch (error) {
        console.error('Planning failed:', error);
        setError(error instanceof Error ? error.message : 'Planning failed');
        toast.error('Failed to generate schedule. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 400);

    setPlanTimeout(timeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [members, availability, goals, vibe, setPlans, setLoading, setError]);

  const handleManualPlan = async () => {
    if (members.length === 0) {
      toast.error('Please add team members first');
      return;
    }

    if (goals.length === 0) {
      toast.error('Please add scheduling goals first');
      return;
    }

    // Clear existing timeout and trigger immediate planning
    if (planTimeout) {
      clearTimeout(planTimeout);
    }

    try {
      setLoading(true);
      setError(undefined);

      const response = await apiService.plan({
        members,
        availability,
        goals,
        vibe
      });

      setPlans(response.plans);

      if (response.plans.length > 0) {
        toast.success(`Generated ${response.plans.length} event${response.plans.length === 1 ? '' : 's'}`);
      } else {
        toast.info('No suitable time slots found. Try adjusting availability or goals.');
      }
    } catch (error) {
      console.error('Planning failed:', error);
      setError(error instanceof Error ? error.message : 'Planning failed');
      toast.error('Failed to generate schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShuffleSelected = async () => {
    if (selectedPlanIds.length === 0) {
      toast.error('Please select events to shuffle first');
      return;
    }

    try {
      setLoading(true);

      // For now, we'll re-plan everything since the mock API doesn't support individual shuffling
      const response = await apiService.plan({
        members,
        availability,
        goals,
        vibe
      });

      setPlans(response.plans);
      setSelectedPlanIds([]);
      toast.success(`Shuffled ${selectedPlanIds.length} event${selectedPlanIds.length === 1 ? '' : 's'}`);
    } catch (error) {
      console.error('Shuffle failed:', error);
      toast.error('Failed to shuffle events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (plans.length === 0) {
      toast.error('No events to book');
      return;
    }

    try {
      setLoading(true);

      const response = await apiService.apply({ plans });

      toast.success(
        `Successfully booked ${response.created.length} event${response.created.length === 1 ? '' : 's'}!`,
        {
          description: 'Your events have been added to everyone\'s calendars.'
        }
      );
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to book events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadICS = () => {
    if (plans.length === 0) {
      toast.error('No events to download');
      return;
    }

    try {
      downloadICS(plans, members);
      toast.success('Calendar file downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download calendar file. Please try again.');
    }
  };

  const hasData = members.length > 0 && goals.length > 0;
  const hasPlans = plans.length > 0;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleManualPlan}
            disabled={!hasData || loading}
            className="flex-1 min-w-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Planning...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Plan Schedule
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleShuffleSelected}
            disabled={!hasPlans || selectedPlanIds.length === 0 || loading}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle Selected
          </Button>

          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={handleBook}
              disabled={!hasPlans || loading}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Events
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadICS}
              disabled={!hasPlans}
            >
              <Download className="h-4 w-4 mr-2" />
              Download ICS
            </Button>
          </div>
        </div>

        {/* Status Information */}
        <div className="mt-3 text-xs text-muted-foreground">
          {!hasData && (
            <div>Add team members and goals to start planning</div>
          )}
          {hasData && !hasPlans && !loading && (
            <div>Ready to generate your schedule</div>
          )}
          {hasPlans && (
            <div>
              {plans.length} event{plans.length === 1 ? '' : 's'} planned
              {selectedPlanIds.length > 0 && ` • ${selectedPlanIds.length} selected`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook to manage selected plans (used by ScheduleBoard)
export function useSelectedPlans() {
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  const togglePlanSelection = useCallback((planId: string) => {
    setSelectedPlanIds(prev =>
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlanIds([]);
  }, []);

  return {
    selectedPlanIds,
    togglePlanSelection,
    clearSelection
  };
}
