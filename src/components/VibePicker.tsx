import { Smile } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNovara, type Vibe } from '../store/useNovara';

interface VibePickerProps {
  className?: string;
}

const VIBE_OPTIONS = {
  cozy: {
    label: 'Cozy',
    emoji: '🥰',
    description: 'Warm, intimate, and relaxed vibes',
    color: 'bg-orange-100 border-orange-300 text-orange-800'
  },
  hype: {
    label: 'Hype',
    emoji: '🔥',
    description: 'High energy, exciting, and dynamic',
    color: 'bg-red-100 border-red-300 text-red-800'
  },
  professional: {
    label: 'Professional',
    emoji: '💼',
    description: 'Clean, structured, and business-focused',
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  }
};

export function VibePicker({ className }: VibePickerProps) {
  const { vibe, setVibe } = useNovara();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="h-5 w-5" />
          Event Vibe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Choose the tone for your event titles and descriptions
          </div>

          <div className="grid grid-cols-1 gap-2">
            {Object.entries(VIBE_OPTIONS).map(([key, option]) => (
              <button
                key={key}
                onClick={() => setVibe(key as Vibe)}
                className={`
                  w-full p-4 border-2 rounded-lg text-left transition-all
                  ${vibe === key
                    ? option.color + ' shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className={`text-sm ${vibe === key ? 'opacity-90' : 'text-muted-foreground'}`}>
                      {option.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Current selection: {VIBE_OPTIONS[vibe].emoji} {VIBE_OPTIONS[vibe].label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
