# Focus Builder - Pomodoro Tracker

A full-stack application to help build focus using the Pomodoro Technique with customizable 5 and 10-minute sessions.

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL
- date-fns

### Frontend
- React with TypeScript
- Vite
- TailwindCSS
- Zustand (state management)
- Axios
- Recharts
- date-fns

## Features

- ✅ Start 5 or 10-minute focus sessions
- ✅ Visual countdown timer with progress ring
- ✅ Mark sessions as successful or unsuccessful
- ✅ Daily session timeline view
- ✅ Statistics dashboard (total sessions, success rate, focus time)
- ✅ Color-coded session status (green=successful, red=unsuccessful)
- ✅ Real-time session tracking

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```bash
createdb focus_builder
```

Or using psql:
```sql
CREATE DATABASE focus_builder;
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/focus_builder
NODE_ENV=development
```

Run database migrations:

```bash
npm run db:migrate
```

Start the backend server:

```bash
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run on http://localhost:3000

## API Endpoints

### Sessions

- `POST /api/sessions` - Create a new session
  ```json
  {
    "duration": 5 // or 10
  }
  ```

- `PATCH /api/sessions/:id/complete` - Complete a session
  ```json
  {
    "status": "successful" // or "unsuccessful"
  }
  ```

- `GET /api/sessions/today` - Get all sessions for today

- `GET /api/sessions/date/:date` - Get sessions for a specific date (YYYY-MM-DD)

- `GET /api/sessions/stats/:date` - Get statistics for a specific date (YYYY-MM-DD)

## Database Schema

### sessions table

| Column     | Type      | Description                                    |
|------------|-----------|------------------------------------------------|
| id         | SERIAL    | Primary key                                    |
| start_time | TIMESTAMP | When the session started                       |
| end_time   | TIMESTAMP | When the session ended (nullable)              |
| duration   | INTEGER   | Session duration in minutes (5 or 10)          |
| status     | VARCHAR   | 'in_progress', 'successful', or 'unsuccessful' |
| date       | DATE      | Date of the session                            |
| created_at | TIMESTAMP | Record creation timestamp                      |

## Usage

1. Open the application in your browser (http://localhost:3000)
2. Click on either "5 Minutes" or "10 Minutes" to start a focus session
3. The timer will count down visually
4. When complete, it will automatically mark as successful
5. You can also click "Stop Session" to mark it as unsuccessful
6. View your daily progress in the timeline below
7. Check your statistics to track your focus performance

## Development

### Backend

```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
npm run build  # Build TypeScript to JavaScript
npm start  # Run production build
```

### Frontend

```bash
cd frontend
npm run dev  # Start development server
npm run build  # Build for production
npm run preview  # Preview production build
```

## Production Deployment

### Backend

1. Build the TypeScript:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run migrations:
   ```bash
   npm run db:migrate
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Serve the `dist` folder using a static file server

## License

MIT
