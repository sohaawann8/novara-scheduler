import { useState } from 'react';
import { Target, Plus, Edit2, Trash2, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useNovara, type Goal, type GoalType, type Member } from '../store/useNovara';
import { generateId, humanizeRRule } from '../lib/time';

// Goal presets with common scheduling patterns
const GOAL_PRESETS = {
  date_night: {
    name: 'Weekly Date Night',
    durationMins: 90,
    rrule: 'FREQ=WEEKLY;BYDAY=FR,SA',
    locationHint: 'Restaurant or home',
    description: '90 minutes, evenings on weekends'
  },
  one_on_one: {
    name: 'One-on-One Check-in',
    durationMins: 45,
    rrule: 'FREQ=WEEKLY;INTERVAL=1',
    locationHint: 'Coffee shop or quiet space',
    description: '45 minutes, twice per week'
  },
  two_friends: {
    name: 'Friends Hangout',
    durationMins: 90,
    rrule: 'FREQ=WEEKLY;INTERVAL=2',
    locationHint: 'Park, cafe, or home',
    description: '90 minutes, biweekly'
  },
  run_walk: {
    name: 'Morning Run/Walk',
    durationMins: 45,
    rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=7,8,9',
    locationHint: 'Local park or neighborhood',
    description: '45 minutes, mornings 3x/week'
  }
};

interface GoalBuilderProps {
  className?: string;
}

export function GoalBuilder({ className }: GoalBuilderProps) {
  const { members, goals, addGoal, updateGoal, removeGoal } = useNovara();
  const [showPresets, setShowPresets] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    type: 'one_on_one',
    participants: [],
    durationMins: 60,
    rrule: 'FREQ=WEEKLY;INTERVAL=1',
    locationHint: '',
    priority: 3
  });

  const handleAddPreset = (type: GoalType) => {
    const preset = GOAL_PRESETS[type];
    if (!preset) return;

    const goal: Goal = {
      id: generateId(),
      type,
      participants: [],
      durationMins: preset.durationMins,
      rrule: preset.rrule,
      locationHint: preset.locationHint,
      priority: 3
    };

    addGoal(goal);
    setShowPresets(false);
  };

  const handleAddCustomGoal = () => {
    if (!newGoal.type || newGoal.participants?.length === 0) return;

    const goal: Goal = {
      id: generateId(),
      type: newGoal.type,
      participants: newGoal.participants || [],
      durationMins: newGoal.durationMins || 60,
      rrule: newGoal.rrule || 'FREQ=WEEKLY;INTERVAL=1',
      locationHint: newGoal.locationHint?.trim() || undefined,
      priority: newGoal.priority || 3
    };

    addGoal(goal);
    setNewGoal({
      type: 'one_on_one',
      participants: [],
      durationMins: 60,
      rrule: 'FREQ=WEEKLY;INTERVAL=1',
      locationHint: '',
      priority: 3
    });
  };

  const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
    updateGoal(id, updates);
    setEditingId(null);
  };

  const toggleParticipant = (goalId: string, memberId: string, participants: string[]) => {
    const newParticipants = participants.includes(memberId)
      ? participants.filter(p => p !== memberId)
      : [...participants, memberId];

    if (editingId === goalId) {
      // We're editing, so this is for the edit form
      return newParticipants;
    } else {
      // Update the goal directly
      updateGoal(goalId, { participants: newParticipants });
      return newParticipants;
    }
  };

  const getGoalTypeDisplay = (type: GoalType): string => {
    const displays = {
      date_night: 'Date Night',
      one_on_one: 'One-on-One',
      two_friends: 'Friends Time',
      run_walk: 'Exercise'
    };
    return displays[type] || type;
  };

  const getPriorityDisplay = (priority: number): string => {
    const displays = {
      1: 'Low',
      2: 'Low-Medium',
      3: 'Medium',
      4: 'Medium-High',
      5: 'High'
    };
    return displays[priority as keyof typeof displays] || 'Medium';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Scheduling Goals ({goals.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Goal Presets */}
        {showPresets && goals.length === 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Quick Start Presets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(GOAL_PRESETS).map(([type, preset]) => (
                <Button
                  key={type}
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => handleAddPreset(type as GoalType)}
                >
                  <div>
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-sm text-muted-foreground">{preset.description}</div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setShowPresets(false)}
              >
                Or create custom goal
              </Button>
            </div>
          </div>
        )}

        {/* Existing Goals */}
        {goals.map((goal) => (
          <div key={goal.id} className="border rounded-lg p-4">
            {editingId === goal.id ? (
              <EditGoalForm
                goal={goal}
                members={members}
                onSave={(updates) => handleUpdateGoal(goal.id, updates)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {getGoalTypeDisplay(goal.type)}
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        Priority {goal.priority}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {goal.durationMins}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {goal.participants.length} people
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(goal.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Participants */}
                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">Participants:</div>
                  <div className="flex flex-wrap gap-2">
                    {members.map((member) => (
                      <label key={member.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={goal.participants.includes(member.id)}
                          onCheckedChange={() => {
                            const newParticipants = toggleParticipant(goal.id, member.id, goal.participants);
                            updateGoal(goal.id, { participants: newParticipants });
                          }}
                        />
                        {member.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Schedule Pattern */}
                <div className="text-sm">
                  <div className="font-medium">Schedule:</div>
                  <div className="text-muted-foreground">{humanizeRRule(goal.rrule)}</div>
                </div>

                {goal.locationHint && (
                  <div className="text-sm mt-2">
                    <div className="font-medium">Location:</div>
                    <div className="text-muted-foreground">{goal.locationHint}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add New Goal Form */}
        {(!showPresets || goals.length > 0) && (
          <div className="border-2 border-dashed rounded-lg p-4">
            <h4 className="font-medium mb-3">Add New Goal</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Goal Type</Label>
                  <Select
                    value={newGoal.type}
                    onValueChange={(value: GoalType) => setNewGoal({ ...newGoal, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_night">Date Night</SelectItem>
                      <SelectItem value="one_on_one">One-on-One</SelectItem>
                      <SelectItem value="two_friends">Friends Time</SelectItem>
                      <SelectItem value="run_walk">Exercise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="15"
                    max="480"
                    step="15"
                    value={newGoal.durationMins}
                    onChange={(e) => setNewGoal({ ...newGoal, durationMins: Number.parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>

              <div>
                <Label>Participants</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {members.map((member) => (
                    <label key={member.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={newGoal.participants?.includes(member.id) || false}
                        onCheckedChange={(checked) => {
                          const currentParticipants = newGoal.participants || [];
                          const newParticipants = checked
                            ? [...currentParticipants, member.id]
                            : currentParticipants.filter(p => p !== member.id);
                          setNewGoal({ ...newGoal, participants: newParticipants });
                        }}
                      />
                      {member.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Recurrence Pattern</Label>
                  <Select
                    value={newGoal.rrule}
                    onValueChange={(value) => setNewGoal({ ...newGoal, rrule: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREQ=WEEKLY;INTERVAL=1">Weekly</SelectItem>
                      <SelectItem value="FREQ=WEEKLY;INTERVAL=2">Biweekly</SelectItem>
                      <SelectItem value="FREQ=WEEKLY;BYDAY=MO,WE,FR">3x per week</SelectItem>
                      <SelectItem value="FREQ=WEEKLY;BYDAY=SA,SU">Weekends only</SelectItem>
                      <SelectItem value="FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR">Weekdays only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority (1-5)</Label>
                  <Select
                    value={newGoal.priority?.toString()}
                    onValueChange={(value) => setNewGoal({ ...newGoal, priority: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Low</SelectItem>
                      <SelectItem value="2">2 - Low-Medium</SelectItem>
                      <SelectItem value="3">3 - Medium</SelectItem>
                      <SelectItem value="4">4 - Medium-High</SelectItem>
                      <SelectItem value="5">5 - High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Location Hint (optional)</Label>
                <Input
                  placeholder="e.g., Coffee shop, park, home office"
                  value={newGoal.locationHint}
                  onChange={(e) => setNewGoal({ ...newGoal, locationHint: e.target.value })}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Schedule: {humanizeRRule(newGoal.rrule || 'FREQ=WEEKLY;INTERVAL=1')}
              </div>

              <Button
                onClick={handleAddCustomGoal}
                disabled={!newGoal.type || !newGoal.participants?.length}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EditGoalFormProps {
  goal: Goal;
  members: Member[];
  onSave: (updates: Partial<Goal>) => void;
  onCancel: () => void;
}

function EditGoalForm({ goal, members, onSave, onCancel }: EditGoalFormProps) {
  const [formData, setFormData] = useState<Partial<Goal>>({
    type: goal.type,
    participants: [...goal.participants],
    durationMins: goal.durationMins,
    rrule: goal.rrule,
    locationHint: goal.locationHint || '',
    priority: goal.priority
  });

  const handleSave = () => {
    if (!formData.participants?.length) return;
    onSave(formData);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Goal Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: GoalType) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_night">Date Night</SelectItem>
              <SelectItem value="one_on_one">One-on-One</SelectItem>
              <SelectItem value="two_friends">Friends Time</SelectItem>
              <SelectItem value="run_walk">Exercise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Duration (minutes)</Label>
          <Input
            type="number"
            min="15"
            max="480"
            step="15"
            value={formData.durationMins}
            onChange={(e) => setFormData({ ...formData, durationMins: Number.parseInt(e.target.value) || 60 })}
          />
        </div>
      </div>

      <div>
        <Label>Participants</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {members.map((member) => (
            <label key={member.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={formData.participants?.includes(member.id) || false}
                onCheckedChange={(checked) => {
                  const currentParticipants = formData.participants || [];
                  const newParticipants = checked
                    ? [...currentParticipants, member.id]
                    : currentParticipants.filter(p => p !== member.id);
                  setFormData({ ...formData, participants: newParticipants });
                }}
              />
              {member.name}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Recurrence Pattern</Label>
          <Select
            value={formData.rrule}
            onValueChange={(value) => setFormData({ ...formData, rrule: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREQ=WEEKLY;INTERVAL=1">Weekly</SelectItem>
              <SelectItem value="FREQ=WEEKLY;INTERVAL=2">Biweekly</SelectItem>
              <SelectItem value="FREQ=WEEKLY;BYDAY=MO,WE,FR">3x per week</SelectItem>
              <SelectItem value="FREQ=WEEKLY;BYDAY=SA,SU">Weekends only</SelectItem>
              <SelectItem value="FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR">Weekdays only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority (1-5)</Label>
          <Select
            value={formData.priority?.toString()}
            onValueChange={(value) => setFormData({ ...formData, priority: Number.parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Low</SelectItem>
              <SelectItem value="2">2 - Low-Medium</SelectItem>
              <SelectItem value="3">3 - Medium</SelectItem>
              <SelectItem value="4">4 - Medium-High</SelectItem>
              <SelectItem value="5">5 - High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Location Hint (optional)</Label>
        <Input
          value={formData.locationHint}
          onChange={(e) => setFormData({ ...formData, locationHint: e.target.value })}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        Schedule: {humanizeRRule(formData.rrule || 'FREQ=WEEKLY;INTERVAL=1')}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={!formData.participants?.length}
          size="sm"
        >
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
}
