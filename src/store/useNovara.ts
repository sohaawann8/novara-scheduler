import { create } from 'zustand';

export type Member = {
  id: string;
  name: string;
  email: string;
  tz: string;
  home?: string;
  office?: string;
};

export type AvailabilityWindow = {
  id: string;
  memberId: string;
  day: number; // 0-6 (Sunday-Saturday)
  start: string; // HH:MM format
  end: string; // HH:MM format
  locationPref?: 'home' | 'office' | 'either';
};

export type GoalType = 'date_night' | 'one_on_one' | 'two_friends' | 'run_walk';

export type Goal = {
  id: string;
  type: GoalType;
  participants: string[]; // member IDs
  durationMins: number;
  rrule: string;
  locationHint?: string;
  priority: number; // 1-5
};

export type PlannedEvent = {
  goalId: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  memberIds: string[];
  title: string;
  notes: string;
  location?: string;
};

export type Vibe = 'cozy' | 'hype' | 'professional';

interface NovaraStore {
  // State
  members: Member[];
  availability: AvailabilityWindow[];
  goals: Goal[];
  vibe: Vibe;
  plans: PlannedEvent[];
  loading: boolean;
  error?: string;

  // Actions
  setMembers: (members: Member[]) => void;
  addMember: (member: Member) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  removeMember: (id: string) => void;

  setAvailability: (availability: AvailabilityWindow[]) => void;
  addAvailability: (window: AvailabilityWindow) => void;
  removeAvailability: (id: string) => void;

  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;

  setVibe: (vibe: Vibe) => void;
  setPlans: (plans: PlannedEvent[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;

  reset: () => void;
}

const initialState = {
  members: [],
  availability: [],
  goals: [],
  vibe: 'cozy' as Vibe,
  plans: [],
  loading: false,
  error: undefined,
};

export const useNovara = create<NovaraStore>((set, get) => ({
  ...initialState,

  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  updateMember: (id, updates) => set((state) => ({
    members: state.members.map((m) => (m.id === id ? { ...m, ...updates } : m))
  })),
  removeMember: (id) => set((state) => ({
    members: state.members.filter((m) => m.id !== id),
    availability: state.availability.filter((a) => a.memberId !== id),
    goals: state.goals.map((g) => ({
      ...g,
      participants: g.participants.filter((p) => p !== id)
    }))
  })),

  setAvailability: (availability) => set({ availability }),
  addAvailability: (window) => set((state) => ({ availability: [...state.availability, window] })),
  removeAvailability: (id) => set((state) => ({
    availability: state.availability.filter((a) => a.id !== id)
  })),

  setGoals: (goals) => set({ goals }),
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  updateGoal: (id, updates) => set((state) => ({
    goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g))
  })),
  removeGoal: (id) => set((state) => ({
    goals: state.goals.filter((g) => g.id !== id),
    plans: state.plans.filter((p) => p.goalId !== id)
  })),

  setVibe: (vibe) => set({ vibe }),
  setPlans: (plans) => set({ plans }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
