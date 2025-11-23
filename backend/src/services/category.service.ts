import { query } from '../database/db';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../types/session.types';

export const categoryService = {
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    const result = await query(
      'SELECT * FROM categories ORDER BY id ASC'
    );
    return result.rows;
  },

  // Get category by ID
  async getCategoryById(id: number): Promise<Category | null> {
    const result = await query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Get Quick Focus category
  async getQuickFocusCategory(): Promise<Category | null> {
    const result = await query(
      'SELECT * FROM categories WHERE is_quick_focus = true LIMIT 1'
    );
    return result.rows[0] || null;
  },

  // Create a new category (user-defined)
  async createCategory(data: CreateCategoryDTO): Promise<Category> {
    const result = await query(
      `INSERT INTO categories (name, color, is_quick_focus)
       VALUES ($1, $2, false)
       RETURNING *`,
      [data.name, data.color]
    );
    return result.rows[0];
  },

  // Update a category
  async updateCategory(id: number, data: UpdateCategoryDTO): Promise<Category | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCounter++}`);
      values.push(data.name);
    }

    if (data.color !== undefined) {
      updates.push(`color = $${paramCounter++}`);
      values.push(data.color);
    }

    if (updates.length === 0) {
      return this.getCategoryById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE categories 
       SET ${updates.join(', ')}
       WHERE id = $${paramCounter}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  },

  // Delete a category (will cascade delete tasks and sessions)
  async deleteCategory(id: number): Promise<boolean> {
    // Don't allow deleting Quick Focus category
    const category = await this.getCategoryById(id);
    if (category?.is_quick_focus) {
      throw new Error('Cannot delete Quick Focus category');
    }

    const result = await query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  },
};
