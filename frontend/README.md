# Focus Builder Frontend

React frontend for the Focus Builder Pomodoro application.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── api/              # API client functions
├── components/       # React components
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Components

- **Timer** - Countdown timer with circular progress indicator
- **SessionSelector** - Buttons to select 5 or 10 minute sessions
- **DailyView** - Timeline of all sessions for the day
- **Stats** - Dashboard showing daily statistics

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Zustand
- Axios
- date-fns
