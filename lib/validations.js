import { body } from 'express-validator';

export const postCreateValidation = [
    body('title', 'Enter the title').isLength({ min: 3 }).isString(),
    body('text', 'Enter text for the blog').isLength({ min: 3 }).isString(),
    body('tags', 'Invalid tags').optional(),
    body('imageUrl', 'Invalid image url').optional().isString(),
  ]