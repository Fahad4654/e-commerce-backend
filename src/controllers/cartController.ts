
import { Response } from 'express';
import * as cartService from '../services/cartService';
import { AuthRequest } from '../middleware/authMiddleware';

export const getCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const guestId = req.guestId;

  if (!userId && !guestId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const cart = await cartService.getCart(userId, guestId);
    res.json(cart);
  } catch (error) {
    if (error instanceof Error) {
        if (error.message === 'Cart not found') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Error getting cart', error: error.message });
    }
    res.status(500).json({ message: 'Error getting cart', error: 'An unknown error occurred' });
  }
};

export const addItemToCart = async (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body;
  const userId = req.user?.id;
  const guestId = req.guestId;

  if (!userId && !guestId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const cart = await cartService.addItemToCart(userId, guestId, productId, quantity);
    res.status(201).json(cart);
  } catch (error) {
    if (error instanceof Error) {
        switch (error.message) {
            case 'Product not found':
                return res.status(404).json({ message: error.message });
            case 'Insufficient stock':
                return res.status(400).json({ message: error.message });
            default:
                return res.status(500).json({ message: 'Error adding item to cart', error: error.message });
        }
    }
    res.status(500).json({ message: 'Error adding item to cart', error: 'An unknown error occurred' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user?.id;
  const guestId = req.guestId;

  if (!userId && !guestId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const cart = await cartService.updateCartItem(userId, guestId, parseInt(itemId), quantity);
    res.json(cart);
  } catch (error) {
    if (error instanceof Error) {
        switch (error.message) {
            case 'Cart item not found':
                return res.status(404).json({ message: error.message });
            case 'Insufficient stock':
                return res.status(400).json({ message: error.message });
            default:
                return res.status(500).json({ message: 'Error updating cart item', error: error.message });
        }
    }
    res.status(500).json({ message: 'Error updating cart item', error: 'An unknown error occurred' });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const userId = req.user?.id;
    const guestId = req.guestId;
  
    if (!userId && !guestId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
        const cart = await cartService.removeCartItem(userId, guestId, parseInt(itemId));
        res.status(200).json(cart);
      } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Cart item not found') {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Error removing cart item', error: error.message });
        }
        res.status(500).json({ message: 'Error removing cart item', error: 'An unknown error occurred' });
      }
  };