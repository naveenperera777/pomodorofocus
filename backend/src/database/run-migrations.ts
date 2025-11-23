import createCategoriesTable from './create-categories-table';
import createTasksTable from './create-tasks-table';
import updateSessionsTable from './update-sessions-table';

async function runAllMigrations() {
  console.log('=== Starting database migrations ===\n');
  
  try {
    console.log('Step 1: Creating categories table...');
    await createCategoriesTable();
    console.log('✓ Categories table created\n');
    
    console.log('Step 2: Creating tasks table...');
    await createTasksTable();
    console.log('✓ Tasks table created\n');
    
    console.log('Step 3: Updating sessions table...');
    await updateSessionsTable();
    console.log('✓ Sessions table updated\n');
    
    console.log('=== All migrations completed successfully! ===');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runAllMigrations();
