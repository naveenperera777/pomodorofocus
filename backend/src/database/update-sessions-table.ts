import { query } from './db';

async function updateSessionsTable() {
  console.log('Updating sessions table to reference tasks...');
  
  try {
    // First, drop the old table and recreate with the new schema
    // (This is acceptable since we're starting fresh and deleting mock data)
    console.log('Dropping old sessions table...');
    await query(`
      DROP TABLE IF EXISTS sessions CASCADE;
    `);
    
    console.log('Creating new sessions table with task_id reference...');
    await query(`
      CREATE TABLE sessions (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        actual_duration INTEGER,
        status VARCHAR(20) NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      COMMENT ON TABLE sessions IS 'Focus sessions that belong to tasks';
      COMMENT ON COLUMN sessions.task_id IS 'Reference to the parent task (required - no orphan sessions)';
      COMMENT ON COLUMN sessions.actual_duration IS 'Actual session duration in seconds';
      COMMENT ON COLUMN sessions.status IS 'Session status: in_progress, completed, or abandoned';
    `);
    
    console.log('Creating index on sessions(task_id)...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_task_id ON sessions(task_id);
    `);
    
    console.log('Creating unique constraint for one in-progress session...');
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_one_in_progress
      ON sessions(task_id, status)
      WHERE status = 'in_progress';
    `);
    
    console.log('Creating index on sessions(start_time)...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
    `);
    
    console.log('Sessions table updated successfully!');
    
  } catch (error) {
    console.error('Error updating sessions table:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  updateSessionsTable()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default updateSessionsTable;
