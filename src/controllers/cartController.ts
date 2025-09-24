
import { Request, Response } from 'express';
import * as cartService from '../services/cartService';

// Get the user's cart
export const getCart = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const cart = await cartService.getCart(userId);

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
    const cartItem = await cartService.addItemToCart(userId, productId, quantity);
    res.status(200).json(cartItem);
  } catch (error) {
    if (error.message === 'Not enough stock available' || error.message === 'Product not found') {
      return res.status(400).json({ message: error.message });
    }
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
    const updatedItem = await cartService.updateCartItem(userId, parseInt(itemId), quantity);
    res.status(200).json(updatedItem);
  } catch (error) {
    if (error.message === 'Not enough stock available' || error.message === 'Cart item not found') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating cart item', error });
  }
};

// Remove an item from the cart
export const removeCartItem = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { itemId } = req.params;

  try {
    await cartService.removeCartItem(userId, parseInt(itemId));
    res.status(200).json({ message: 'Cart item removed' });
  } catch (error) {
    if (error.message === 'Cart item not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error removing cart item', error });
  }
};
