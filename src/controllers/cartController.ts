
// src/controllers/cartController.ts

import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// Utility function to find or create a cart for a user or guest
async function findOrCreateCart(userIdentifier: { id: number } | { guestId: string }) {
  let cart;
  const where = 'id' in userIdentifier ? { userId: userIdentifier.id } : { guestId: userIdentifier.guestId };

  cart = await prisma.cart.findUnique({ where, include: { items: { include: { product: true } } } });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { ...where },
      include: { items: { include: { product: true } } },
    });
  }

  return cart;
}


// Get the current user's or guest's cart
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userIdentifier = req.user ? { id: req.user.id } : { guestId: req.guestId! };
    const cart = await findOrCreateCart(userIdentifier);
    res.json(cart);
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Add an item to the cart
export const addToCart = async (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Product ID and a valid quantity are required' });
  }

  try {
    const userIdentifier = req.user ? { id: req.user.id } : { guestId: req.guestId! };
    const cart = await findOrCreateCart(userIdentifier);

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      // If item exists, update its quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // If item does not exist, create a new cart item
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({ 
        where: { id: cart.id },
        include: { items: { include: { product: true } } } 
    });

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Update a cart item's quantity
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: 'A valid quantity is required' });
  }

  try {
    const userIdentifier = req.user ? { id: req.user.id } : { guestId: req.guestId! };
    const cart = await findOrCreateCart(userIdentifier);

    const itemToUpdate = await prisma.cartItem.findFirst({
        where: { id: parseInt(itemId, 10), cartId: cart.id }
    });

    if(!itemToUpdate){
        return res.status(404).json({ error: 'Cart item not found or does not belong to the user' });
    }

    await prisma.cartItem.update({
      where: { id: parseInt(itemId, 10) },
      data: { quantity },
    });

    const updatedCart = await prisma.cart.findUnique({ 
        where: { id: cart.id },
        include: { items: { include: { product: true } } } 
    });

    res.json(updatedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Remove an item from the cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params;

  try {
    const userIdentifier = req.user ? { id: req.user.id } : { guestId: req.guestId! };
    const cart = await findOrCreateCart(userIdentifier);

    const itemToRemove = await prisma.cartItem.findFirst({
        where: { id: parseInt(itemId, 10), cartId: cart.id }
    });

    if(!itemToRemove){
        return res.status(404).json({ error: 'Cart item not found or does not belong to the user' });
    }

    await prisma.cartItem.delete({ where: { id: parseInt(itemId, 10) } });

    const updatedCart = await prisma.cart.findUnique({ 
        where: { id: cart.id },
        include: { items: { include: { product: true } } } 
    });

    res.json(updatedCart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
