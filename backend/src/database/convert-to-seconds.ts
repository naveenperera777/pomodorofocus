import { pool } from './db';

const updateDurationColumns = `
  -- Add new columns for duration in seconds
  ALTER TABLE sessions 
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS actual_duration_seconds INTEGER;

  -- Convert existing duration from minutes to seconds (if exists)
  UPDATE sessions 
  SET duration_seconds = duration * 60 
  WHERE duration_seconds IS NULL AND duration IS NOT NULL;

  -- Convert existing actual_duration from minutes to seconds (if exists)
  UPDATE sessions 
  SET actual_duration_seconds = actual_duration * 60 
  WHERE actual_duration_seconds IS NULL AND actual_duration IS NOT NULL;

  -- Drop old columns and rename new ones
  ALTER TABLE sessions 
  DROP COLUMN IF EXISTS duration,
  DROP COLUMN IF EXISTS actual_duration;

  ALTER TABLE sessions 
  RENAME COLUMN duration_seconds TO duration;

  ALTER TABLE sessions 
  RENAME COLUMN actual_duration_seconds TO actual_duration;

  -- Make duration NOT NULL
  ALTER TABLE sessions 
  ALTER COLUMN duration SET NOT NULL;
`;

async function updateDurations() {
  try {
    console.log('Converting duration columns to seconds...');
    await pool.query(updateDurationColumns);
    console.log('Duration columns updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

updateDurations();
