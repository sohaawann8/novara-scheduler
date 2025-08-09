import { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Shuffle, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useNovara, type PlannedEvent, type Goal } from '../store/useNovara';
import { formatDateTime } from '../lib/time';

interface ScheduleBoardProps {
  className?: string;
  selectedPlanIds?: string[];
  onTogglePlanSelection?: (planId: string) => void;
}

export function ScheduleBoard({
  className,
  selectedPlanIds = [],
  onTogglePlanSelection
}: ScheduleBoardProps) {
  const { members, goals, plans, loading } = useNovara();

  // Group plans by goal
  const plansByGoal = plans.reduce((acc, plan) => {
    const goalId = plan.goalId;
    if (!acc[goalId]) {
      acc[goalId] = [];
    }
    acc[goalId].push(plan);
    return acc;
  }, {} as Record<string, PlannedEvent[]>);

  // Get goal by ID
  const getGoal = (goalId: string): Goal | undefined => {
    return goals.find(g => g.id === goalId);
  };

  // Get member names by IDs
  const getMemberNames = (memberIds: string[]): string[] => {
    return memberIds
      .map(id => members.find(m => m.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const getGoalTypeDisplay = (type: string): string => {
    const displays = {
      date_night: 'Date Night',
      one_on_one: 'One-on-One',
      two_friends: 'Friends Time',
      run_walk: 'Exercise'
    };
    return displays[type as keyof typeof displays] || type;
  };

  const getPriorityColor = (priority: number): string => {
    const colors = {
      1: 'bg-gray-100 text-gray-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-green-100 text-green-800',
      4: 'bg-yellow-100 text-yellow-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors[3];
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="border rounded-lg p-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (plans.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No events scheduled yet</h3>
            <p className="text-muted-foreground mb-4">
              Add team members, set availability, and create goals to get started
            </p>
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
          Schedule Board ({plans.length} events)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <AnimatePresence>
            {Object.entries(plansByGoal).map(([goalId, goalPlans]) => {
              const goal = getGoal(goalId);
              if (!goal) return null;

              return (
                <motion.div
                  key={goalId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{getGoalTypeDisplay(goal.type)}</h3>
                      <Badge className={getPriorityColor(goal.priority)}>
                        Priority {goal.priority}
                      </Badge>
                      <Badge variant="outline">
                        {goalPlans.length} event{goalPlans.length === 1 ? '' : 's'}
                      </Badge>
                    </div>

                    <div className="grid gap-3">
                      {goalPlans.map((plan) => (
                        <EventCard
                          key={`${plan.goalId}-${plan.start}`}
                          plan={plan}
                          goal={goal}
                          memberNames={getMemberNames(plan.memberIds)}
                          isSelected={selectedPlanIds.includes(`${plan.goalId}-${plan.start}`)}
                          onToggleSelection={() =>
                            onTogglePlanSelection?.(`${plan.goalId}-${plan.start}`)
                          }
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

interface EventCardProps {
  plan: PlannedEvent;
  goal: Goal;
  memberNames: string[];
  isSelected: boolean;
  onToggleSelection: () => void;
}

function EventCard({
  plan,
  goal,
  memberNames,
  isSelected,
  onToggleSelection
}: EventCardProps) {
  const [isShuffling, setIsShuffling] = useState(false);

  const handleShuffle = async () => {
    setIsShuffling(true);
    // Simulate shuffle delay
    setTimeout(() => {
      setIsShuffling(false);
      // In a real app, this would call the shuffle API
    }, 1000);
  };

  return (
    <motion.div
      layout
      className={`
        border rounded-lg p-4 transition-all
        ${isSelected
          ? 'border-blue-300 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelection}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium truncate">{plan.title}</h4>
              {isShuffling && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shuffle className="h-3 w-3 animate-spin" />
                  Shuffling...
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(plan.start)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {memberNames.join(', ')}
                </span>
              </div>

              {plan.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {plan.location}
                </div>
              )}

              {plan.notes && (
                <div className="text-xs italic">
                  "{plan.notes}"
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShuffle}
            disabled={isShuffling}
            title="Try a different time slot"
          >
            <Shuffle className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            title="Edit goal settings"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Empty state when no plans exist
export function EmptyScheduleBoard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Ready to create your schedule</h3>
          <p className="text-muted-foreground">
            Your planned events will appear here once you have:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Added team members</li>
            <li>• Set availability windows</li>
            <li>• Created scheduling goals</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
