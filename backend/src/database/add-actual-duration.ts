import { pool } from './db';

const addActualDurationColumn = `
  ALTER TABLE sessions 
  ADD COLUMN IF NOT EXISTS actual_duration INTEGER;
`;

async function addColumn() {
  try {
    console.log('Adding actual_duration column to sessions table...');
    await pool.query(addActualDurationColumn);
    console.log('Column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addColumn();
