import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';

export const categoryController = {
  // GET /categories - Get all categories
  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  },

  // GET /categories/:id - Get category by ID
  async getCategoryById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const category = await categoryService.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  },

  // POST /categories - Create a new category
  async createCategory(req: Request, res: Response) {
    try {
      const { name, color } = req.body;
      
      if (!name || !color) {
        return res.status(400).json({ error: 'Name and color are required' });
      }
      
      const category = await categoryService.createCategory({ name, color });
      res.status(201).json(category);
    } catch (error: any) {
      console.error('Error creating category:', error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Category with this name already exists' });
      }
      res.status(500).json({ error: 'Failed to create category' });
    }
  },

  // PATCH /categories/:id - Update a category
  async updateCategory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name, color } = req.body;
      
      const category = await categoryService.updateCategory(id, { name, color });
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(category);
    } catch (error: any) {
      console.error('Error updating category:', error);
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Category with this name already exists' });
      }
      res.status(500).json({ error: 'Failed to update category' });
    }
  },

  // DELETE /categories/:id - Delete a category
  async deleteCategory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const deleted = await categoryService.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      if (error.message.includes('Quick Focus')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete category' });
    }
  },
};
