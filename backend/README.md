# Focus Builder Backend

Backend API for the Focus Builder Pomodoro application.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Configure your PostgreSQL connection in `.env`

4. Run migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run db:migrate` - Run database migrations

## Environment Variables

```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/focus_builder
NODE_ENV=development
```

## API Documentation

See main README.md for API endpoints documentation.
