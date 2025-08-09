import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { MemberForm } from './components/MemberForm';
import { AvailabilityGrid } from './components/AvailabilityGrid';
import { GoalBuilder } from './components/GoalBuilder';
import { VibePicker } from './components/VibePicker';
import { ControlBar, useSelectedPlans } from './components/ControlBar';
import { ScheduleBoard } from './components/ScheduleBoard';
import { SampleDataButton } from './components/SampleDataButton';
import { useNovara } from './store/useNovara';

function App() {
  const { reset } = useNovara();
  const { selectedPlanIds, togglePlanSelection, clearSelection } = useSelectedPlans();

  const [mobileView, setMobileView] = useState<'setup' | 'schedule'>('setup');

  const handleReset = () => {
    reset();
    clearSelection();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Novara</h1>
              <span className="ml-2 text-sm text-gray-500">Auto-Scheduler</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Mobile view toggle */}
              <div className="md:hidden flex rounded-md border border-gray-300">
                <button
                  onClick={() => setMobileView('setup')}
                  className={`px-3 py-1 text-sm rounded-l-md ${
                    mobileView === 'setup'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Setup
                </button>
                <button
                  onClick={() => setMobileView('schedule')}
                  className={`px-3 py-1 text-sm rounded-r-md ${
                    mobileView === 'schedule'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Schedule
                </button>
              </div>

              <SampleDataButton />

              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset Demo</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Setup Panel */}
          <div className={`space-y-6 ${mobileView === 'schedule' ? 'hidden md:block' : ''}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Setup</h2>
              <div className="text-sm text-gray-500">Configure your team and preferences</div>
            </div>

            {/* Member Management */}
            <MemberForm />

            {/* Availability Grid */}
            <AvailabilityGrid />

            {/* Goal Builder */}
            <GoalBuilder />

            {/* Vibe Picker */}
            <VibePicker />

            {/* Control Bar - visible on both panels on mobile */}
            <div className="md:hidden">
              <ControlBar />
            </div>
          </div>

          {/* Schedule Panel */}
          <div className={`space-y-6 ${mobileView === 'setup' ? 'hidden md:block' : ''}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Schedule Board</h2>
              <div className="text-sm text-gray-500">Your planned events</div>
            </div>

            {/* Control Bar - hidden on mobile (shown in setup panel) */}
            <div className="hidden md:block">
              <ControlBar />
            </div>

            {/* Schedule Board */}
            <ScheduleBoard
              selectedPlanIds={selectedPlanIds}
              onTogglePlanSelection={togglePlanSelection}
            />
          </div>
        </div>
      </main>

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
        }}
      />
    </div>
  );
}

export default App;
