
// src/controllers/productController.ts

import { Request, Response } from 'express';
import prisma from '../db/prisma';

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new product (Admin only)
export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, imageUrl, stock } = req.body;

  if (!name || !description || !price || !stock) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        stock,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a product (Admin only)
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, stock, imageUrl } = req.body;

  try {
    const updateData: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      imageUrl?: string;
    } = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (stock) updateData.stock = parseInt(stock, 10);
    if (imageUrl) updateData.imageUrl = imageUrl;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a product (Admin only)
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
