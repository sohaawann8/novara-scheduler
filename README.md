# Novara Auto-Scheduler

A modern TypeScript React web application for intelligent team scheduling. The Novara Auto-Scheduler helps teams coordinate meetings, social events, and recurring activities by analyzing member availability and automatically generating optimal schedules.

## Features

### 🎯 **Smart Scheduling**
- Automatic conflict resolution based on team availability
- Support for recurring events with RRULE patterns
- Priority-based scheduling algorithm
- Real-time schedule updates with 400ms debouncing

### 👥 **Team Management**
- Support for up to 6 team members
- Timezone-aware scheduling
- Email validation and contact management
- Home and office location tracking

### 📅 **Availability Management**
- Interactive weekly availability grid (07:00-22:00)
- Click-and-drag time slot selection
- Copy/paste schedules between days
- 30-minute time slot granularity

### 🎪 **Goal-Based Scheduling**
- Preset templates: Date nights, one-on-ones, friend hangouts, exercise
- Custom goal creation with flexible parameters
- Recurrence pattern support (weekly, biweekly, custom)
- Location preferences and hints

### 🎨 **Customizable Vibes**
- **Cozy**: Warm, intimate event descriptions
- **Hype**: High-energy, exciting language
- **Professional**: Clean, business-focused tone

### 📱 **Modern UX**
- Mobile-first responsive design
- Smooth animations with Framer Motion
- Real-time toast notifications
- Accessibility features (ARIA, keyboard navigation)

### 📄 **Export & Integration**
- Download schedules as .ics calendar files
- One-click booking to member calendars
- Bulk event management
- Individual event shuffling

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Zustand** for state management
- **date-fns** and **rrule** for date/time handling
- **Framer Motion** for animations
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Modern web browser

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd novara-scheduler
   bun install
   ```

2. **Set up environment variables (optional)**
   ```bash
   cp .env.example .env
   # Edit .env to add your backend API URL
   ```

3. **Start the development server**
   ```bash
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Environment Configuration

The app works offline with mock data by default. To connect to a real backend:

```env
# .env
VITE_API_BASE=https://your-api-server.com
```

## API Integration

### Mock API (Default)
When `VITE_API_BASE` is not set, the app uses a built-in mock API that:
- Generates deterministic fake time slots
- Creates vibe-aware event titles and descriptions
- Simulates network delays for realistic testing

### Real API Endpoints
When connected to a backend, the app expects these endpoints:

#### `POST /plan`
Generate schedule from team data
```json
{
  "members": Member[],
  "availability": AvailabilityWindow[],
  "goals": Goal[],
  "vibe": "cozy" | "hype" | "professional"
}
```

#### `POST /apply`
Book the generated events
```json
{
  "plans": PlannedEvent[]
}
```

## Project Structure

```
src/
├── components/           # React components
│   ├── MemberForm.tsx           # Team member management
│   ├── AvailabilityGrid.tsx     # Weekly availability editor
│   ├── GoalBuilder.tsx          # Goal creation and presets
│   ├── VibePicker.tsx           # Event tone selector
│   ├── ControlBar.tsx           # Action buttons
│   ├── ScheduleBoard.tsx        # Event display and management
│   └── SampleDataButton.tsx     # Demo data loader
├── lib/                  # Utility libraries
│   ├── api.ts                   # API service with mock/real modes
│   ├── ics.ts                   # Calendar file export
│   └── time.ts                  # Date/time utilities
├── store/                # State management
│   └── useNovara.ts             # Zustand store
└── App.tsx               # Main application component
```

## Usage Guide

### 1. **Add Team Members**
- Click "Add Member" to create team profiles
- Enter names, emails, and timezones
- Optionally add home and office addresses

### 2. **Set Availability**
- Select a member from the dropdown
- Click and drag on the weekly grid to mark available times
- Use copy/paste buttons to duplicate schedules across days

### 3. **Create Goals**
- Choose from preset templates or create custom goals
- Select participants, duration, and recurrence patterns
- Set priority levels (1-5) for scheduling conflicts

### 4. **Choose Event Vibe**
- Pick the tone for automatically generated event descriptions
- Options: Cozy, Hype, or Professional

### 5. **Generate Schedule**
- The app automatically plans events based on your configuration
- Use "Shuffle" to try different time slots
- Select events and use bulk actions

### 6. **Export & Book**
- Download .ics files for calendar import
- Book events directly to member calendars
- Share schedules with your team

## Sample Data

Click "Load Sample Data" to populate the app with:
- 6 diverse team members with realistic availability
- Common scheduling goals (date nights, one-on-ones, exercise)
- Varied availability patterns for testing

## Development

### Running Tests
```bash
bun test
```

### Building for Production
```bash
bun build
```

### Linting
```bash
bun lint
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with modern JavaScript support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please:
1. Check the documentation above
2. Search existing GitHub issues
3. Create a new issue with detailed reproduction steps

---

Built with ❤️ for teams who value their time together.
