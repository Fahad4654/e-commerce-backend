
// src/controllers/categoryController.ts

import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const categories = await prisma.category.findMany({
      skip: offset,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc',
      },
    });

    const totalCategories = await prisma.category.count();

    res.json({
      categories,
      totalPages: Math.ceil(totalCategories / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
        });
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ error: "Category not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const category = await prisma.category.create({
      data: { name, description },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { name, description },
        });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: "Failed to update category" });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete category" });
    }
};
