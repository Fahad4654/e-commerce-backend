
// src/controllers/productController.ts

import { Request, Response } from 'express';
import prisma from '../db/prisma';
import fs from 'fs';
import path from 'path';

const processAndSaveImages = (files: Express.Multer.File[], productName: string): string[] => {
  const sanitizedProductName = productName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  return files.map((file, index) => {
    const fileExt = path.extname(file.originalname);
    const newFilename = `${sanitizedProductName}-${Date.now()}-${index}${fileExt}`;
    const newPath = path.join('public', 'uploads', newFilename);

    fs.renameSync(file.path, newPath);
    return `/uploads/${newFilename}`;
  });
};

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
  const files = req.files as Express.Multer.File[] | undefined;
  let imagePaths: string[] = [];

  try {
    const { name, description, price, stock } = req.body;

    if (files && files.length > 0) {
      imagePaths = processAndSaveImages(files, name);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        images: imagePaths,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    // Cleanup uploaded files on error
    imagePaths.forEach(filePath => {
      const fullPath = path.join('public', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });
    console.error("Error creating product:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  let newImagePaths: string[] = [];

  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    let { imagesToDelete } = req.body; // Make it mutable

    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let currentImages = product.images;
    let parsedImagesToDelete: string[] = [];

    // 1. Parse and delete images specified in imagesToDelete
    if (imagesToDelete) {
      if (typeof imagesToDelete === 'string') {
        try {
          // Try parsing it as a JSON array
          parsedImagesToDelete = JSON.parse(imagesToDelete);
        } catch (e) {
          // Otherwise, treat it as a single URL string
          parsedImagesToDelete = [imagesToDelete];
        }
      } else if (Array.isArray(imagesToDelete)) {
        parsedImagesToDelete = imagesToDelete;
      }

      if (Array.isArray(parsedImagesToDelete) && parsedImagesToDelete.length > 0) {
        parsedImagesToDelete.forEach(imageUrl => {
          if (typeof imageUrl === 'string' && imageUrl) {
            const fullPath = path.join('public', imageUrl);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        });
        currentImages = currentImages.filter(img => !parsedImagesToDelete.includes(img));
      }
    }

    // 2. Add new images
    if (files && files.length > 0) {
      newImagePaths = processAndSaveImages(files, name || product.name);
    }

    const dataToUpdate: any = {
      name,
      description,
      price: price ? parseFloat(price) : undefined,
      stock: stock ? parseInt(stock, 10) : undefined,
      images: [...currentImages, ...newImagePaths],
    };

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.json(updatedProduct);
  } catch (error) {
    // Cleanup newly uploaded files on error
    newImagePaths.forEach(filePath => {
      const fullPath = path.join('public', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });
    console.error("Error updating product:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete images from filesystem
    product.images.forEach(filePath => {
      const fullPath = path.join('public', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Product not found' });
  }
};
