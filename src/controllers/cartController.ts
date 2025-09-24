
import { Request, Response } from 'express';
import prisma from '../db/prisma';

// Get the user's cart
export const getCart = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error getting cart', error });
  }
};

// Add an item to the cart
export const addItemToCart = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }

  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      // If item exists, update the quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // If item doesn't exist, create a new cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    res.status(200).json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error });
  }
};

// Update a cart item
export const updateCartItem = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity) {
    return res.status(400).json({ message: 'Quantity is required' });
  }

  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(itemId),
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity },
    });

    res.status(200).json({ message: 'Cart item updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item', error });
  }
};

// Remove an item from the cart
export const removeCartItem = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { itemId } = req.params;

  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(itemId),
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id: parseInt(itemId) } });

    res.status(200).json({ message: 'Cart item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing cart item', error });
  }
};
