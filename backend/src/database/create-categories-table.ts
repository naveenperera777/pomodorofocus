import { query } from './db';

async function createCategoriesTable() {
  console.log('Creating categories table...');

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        color VARCHAR(7) NOT NULL,
        is_quick_focus BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      COMMENT ON TABLE categories IS 'Categories for organizing focus tasks';
      COMMENT ON COLUMN categories.name IS 'Category name (e.g., Work, Learning, Reading)';
      COMMENT ON COLUMN categories.color IS 'Hex color code for visualization (e.g., #A8B8A5)';
      COMMENT ON COLUMN categories.is_quick_focus IS 'Special flag for Quick Focus category';
    `);

    console.log('✅ Categories table created successfully');

    // Seed default categories
    console.log('Seeding default categories...');
    
    const defaultCategories = [
      { name: 'Work', color: '#A8B8A5', is_quick_focus: false },
      { name: 'Learning', color: '#C27C4A', is_quick_focus: false },
      { name: 'Reading', color: '#8B9D83', is_quick_focus: false },
      { name: 'Exercise', color: '#D4A574', is_quick_focus: false },
      { name: 'Quick Focus', color: '#B8A5A5', is_quick_focus: true },
    ];

    for (const category of defaultCategories) {
      await query(
        `INSERT INTO categories (name, color, is_quick_focus)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO NOTHING`,
        [category.name, category.color, category.is_quick_focus]
      );
    }

    console.log('✅ Default categories seeded');
  } catch (error) {
    console.error('❌ Error creating categories table:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  createCategoriesTable()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default createCategoriesTable;
