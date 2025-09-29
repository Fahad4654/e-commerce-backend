
// src/controllers/productController.ts

import { Request, Response } from 'express';
import prisma from '../db/prisma';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';

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
  const products = await prisma.product.findMany({
    include: {
      category: true, // Also fetch category info
    },
  });
  res.json(products);
};

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true, // Also fetch category info
      },
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
    const { name, description, price, stock, unit, categoryId } = req.body; // Add categoryId

    // Validation for categoryId
    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' });
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: parseInt(categoryId, 10) },
    });
    if (!categoryExists) {
      return res.status(400).json({ error: 'Invalid categoryId' });
    }

    if (files && files.length > 0) {
      if (files.length > 5) {
        // Cleanup the newly uploaded files since we are aborting
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(400).json({
          error: 'A product cannot have more than 5 images.',
        });
      }
      imagePaths = processAndSaveImages(files, name);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        unit,
        images: imagePaths,
        categoryId: parseInt(categoryId, 10), // Add categoryId to the data
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
    const { name, description, price, stock, unit, categoryId } = req.body; // Add categoryId
    let { imagesToDelete } = req.body; // Make it mutable

    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // If categoryId is provided, check if it exists
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(categoryId, 10) },
      });
      if (!categoryExists) {
        return res.status(400).json({ error: 'Invalid categoryId' });
      }
    }

    let currentImages = product.images;
    let parsedImagesToDelete: string[] = [];

    // 1. Parse and delete images specified in imagesToDelete
    if (imagesToDelete) {
      if (typeof imagesToDelete === 'string') {
        try {
          parsedImagesToDelete = JSON.parse(imagesToDelete);
        } catch (e) {
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

    // 2. Add new images, with validation
    if (files && files.length > 0) {
      if (currentImages.length + files.length > 5) {
        // Cleanup the newly uploaded files since we are aborting
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(400).json({
          error: 'A product cannot have more than 5 images. Please delete some images before adding new ones.',
        });
      }
      newImagePaths = processAndSaveImages(files, name || product.name);
    }

    const dataToUpdate: any = {
      name,
      description,
      price: price ? parseFloat(price) : undefined,
      stock: stock ? parseInt(stock, 10) : undefined,
      unit,
      images: [...currentImages, ...newImagePaths],
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined, // Add categoryId to update
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

    // Before deleting the product, we need to remove it from any carts.
    await prisma.cartItem.deleteMany({
      where: { productId: parseInt(id) },
    });

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    // The error on delete is likely due to foreign key constraints
    // (e.g. product is in an order). Prisma's default behavior on delete is to throw an error.
    // We should either handle this gracefully (e.g. by 'archiving' the product instead of deleting)
    // or ensure related items are deleted (which can be dangerous).
    // For now, let's return a more informative error.
    console.error("Error deleting product:", error);
    res.status(409).json({ error: 'Product could not be deleted. It might be part of an existing order.' });
  }
};

// @desc    Bulk upload products from CSV or Excel
// @route   POST /api/products/bulk-upload
// @access  Private/Admin
export const bulkUploadProducts = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const filePath = req.file.path;
  let results: any[] = [];

  try {
    const fileType = req.file.mimetype;

    if (fileType === "text/csv") {
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", () => resolve())
          .on("error", (error) => reject(error));
      });
    } else if (
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      results = XLSX.utils.sheet_to_json(worksheet);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported file type." });
    }

    const productsToCreate = results.map((product) => {
      const price = parseFloat(product.price);
      const stock = parseInt(product.stock, 10);
      const categoryId = parseInt(product.categoryId, 10);

      if (
        !product.name ||
        isNaN(price) ||
        isNaN(stock) ||
        isNaN(categoryId)
      ) {
        throw new Error(
          "Invalid data in file. Each product must have a name, a valid price, a valid stock quantity, and a valid categoryId."
        );
      }

      return {
        name: product.name,
        description: product.description || "",
        price: price,
        stock: stock,
        unit: product.unit || "unit",
        images: product.images ? product.images.split(",") : [],
        categoryId: categoryId,
      };
    });

    const result = await prisma.product.createMany({
      data: productsToCreate,
      skipDuplicates: true,
    });

    res
      .status(201)
      .json({ message: `${result.count} products created successfully.` });
  } catch (error: any) {
    res.status(500).json({
      error:
        error.message || "An error occurred during the bulk upload process.",
    });
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};
