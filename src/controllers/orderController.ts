
// src/controllers/orderController.ts

import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// Utility function to get the cart for a user or guest
async function getCart(userIdentifier: { id: number } | { guestId: string }) {
  let cart;
  if ('id' in userIdentifier) {
    cart = await prisma.cart.findUnique({
      where: { userId: userIdentifier.id },
      include: { items: { include: { product: true } } },
    });
  } else {
    cart = await prisma.cart.findUnique({
      where: { guestId: userIdentifier.guestId },
      include: { items: { include: { product: true } } },
    });
  }
  return cart;
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  const userIdentifier = req.user ? { id: req.user.id } : { guestId: req.guestId! };

  try {
    const cart = await getCart(userIdentifier);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

    const identifierData = 'id' in userIdentifier 
      ? { userId: userIdentifier.id } 
      : { guestId: userIdentifier.guestId };

    // Create the order with order items
    const order = await prisma.order.create({
      data: {
        ...identifierData,
        total,
        items: {
          create: cart.items.map((item) => ({
            quantity: item.quantity,
            price: item.product.price,
            productId: item.productId,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Clear the user's cart after creating the order
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    
    // If the user is a guest, we can also delete the cart itself if we want
    if ('guestId' in userIdentifier) {
      await prisma.cart.delete({ where: { id: cart.id } });
    }


    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Get all orders for the authenticated user
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// ADMIN: Get all orders from all users
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: { // Include user details for admin
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// ADMIN: Update the status of an order
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId, 10) },
      data: { status },
      include: {
        items: true,
      },
    });
    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
