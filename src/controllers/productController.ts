
// src/controllers/productController.ts

import { Request, Response } from 'express';
import prisma from '../db/prisma';
import fs from 'fs';
import path from 'path';


// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
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

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        images: [],
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock } = req.body;
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        description,
        price,
        stock,
      },
    });
    res.json(product);
  } catch (error) {
    res.status(404).json({ error: 'Product not found' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Product not found' });
  }
};

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private/Admin
export const uploadProductImages = async (req: Request, res: Response) => {
  let renamedFiles: string[] = [];
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const files = req.files as Express.Multer.File[];
    if (files.length < 3 || files.length > 5) {
      return res
        .status(400)
        .json({ error: "Please upload between 3 and 5 images" });
    }

    const sanitizedProductName = product.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const images = files.map((file, index) => {
      const fileExt = path.extname(file.originalname);
      const newFilename = `${sanitizedProductName}-${Date.now()}-${index}${fileExt}`;
      const newPath = path.join('uploads', newFilename);

      fs.renameSync(file.path, newPath);
      renamedFiles.push(newPath);
      return `/uploads/${newFilename}`;
    });

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        images: images,
      },
    });

    res.json(updatedProduct);
  } catch (error) {
    // If an error occurs, delete any files that were already renamed
    renamedFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    console.error("File upload error:", error);
    res.status(500).json({ error: 'Error processing file upload. Please try again.' });
  }
};
