import { pool } from './db';

const createTablesQuery = `
  CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER NOT NULL, -- planned duration in seconds (300 or 600)
    actual_duration INTEGER, -- actual duration in seconds based on start_time and end_time
    status VARCHAR(20) NOT NULL CHECK (status IN ('in_progress', 'successful', 'unsuccessful')),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
  CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
`;

async function migrate() {
  try {
    console.log('Running database migrations...');
    await pool.query(createTablesQuery);
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
