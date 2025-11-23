import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';

const router = Router();

// GET /api/categories - Get all categories
router.get('/', categoryController.getAllCategories);

// GET /api/categories/:id - Get category by ID
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - Create a new category
router.post('/', categoryController.createCategory);

// PATCH /api/categories/:id - Update a category
router.patch('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', categoryController.deleteCategory);

export default router;
