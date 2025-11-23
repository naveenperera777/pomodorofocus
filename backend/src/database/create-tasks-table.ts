import { query } from './db';

async function createTasksTable() {
  console.log('Creating tasks table...');
  
  try {
    // Create tasks table with all required fields and constraints
    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL DEFAULT 'default_user',
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        name VARCHAR(255),
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        planned_start_time TIME NOT NULL,
        planned_end_time TIME NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      COMMENT ON TABLE tasks IS 'Time-blocked tasks with planned start/end times';
      COMMENT ON COLUMN tasks.category_id IS 'Reference to the category this task belongs to';
      COMMENT ON COLUMN tasks.name IS 'Optional task name (nullable for Quick Focus auto-tasks)';
      COMMENT ON COLUMN tasks.status IS 'Task status: active (only one per user) or completed';
    `);
    
    console.log('Creating index on tasks(user_id, date)...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, date);
    `);
    
    console.log('Creating unique constraint for one active task per user...');
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_user_active 
      ON tasks(user_id, status) 
      WHERE status = 'active';
    `);
    
    console.log('Creating check constraint for time logic...');
    await query(`
      ALTER TABLE tasks 
      ADD CONSTRAINT chk_tasks_time_order 
      CHECK (planned_end_time > planned_start_time);
    `);
    
    console.log('Tasks table created successfully!');
    
  } catch (error) {
    console.error('Error creating tasks table:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  createTasksTable()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default createTasksTable;
