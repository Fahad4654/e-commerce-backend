
import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { OrderStatus } from '@prisma/client'; // Import the enum

// Create a new order
export const createOrder = async (req: AuthRequest, res: Response) => {
  const { shippingAddress, phone, paymentMethod, shippingMethod } = req.body;
  const userId = req.user?.id;
  const guestId = req.guestId;

  if (!userId && !guestId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!shippingAddress || !phone || !paymentMethod || !shippingMethod) {
    return res.status(400).json({ 
      message: 'Shipping address, phone, payment method, and shipping method are required' 
    });
  }

  try {
    // Start a transaction to ensure atomicity
    const newOrder = await prisma.$transaction(async (prisma) => {
      const cartIdentifier = userId ? { userId } : { guestId };
      const userCart = await prisma.cart.findUnique({
        where: cartIdentifier,
        include: { items: { include: { product: true } } },
      });

      if (!userCart || userCart.items.length === 0) {
        throw new Error('Your cart is empty. Add items before creating an order.');
      }

      const total = userCart.items.reduce((acc, item) => {
        return acc + item.quantity * item.product.price;
      }, 0);

      const orderData: any = {
        total,
        shippingAddress,
        phone,
        paymentMethod,
        shippingMethod,
        status: 'processing', // Default status
        items: {
          create: userCart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      };

      if (userId) {
        orderData.userId = userId;
      } else if (guestId) {
        orderData.guestId = guestId;
      }

      const order = await prisma.order.create({
        data: orderData,
        include: { items: true },
      });

      await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });

      return order;
    });

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Error creating order', error: message });
  }
};

// Get all orders (for admins)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  try {
    const orders = await prisma.order.findMany({
      skip: offset,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc',
      },
      include: {
        user: { select: { id: true, name: true, email: true } }, // Include user details
        items: { include: { product: true } }, // Include order items and products
      },
    });

    const totalOrders = await prisma.order.count();

    res.json({
      orders,
      totalPages: Math.ceil(totalOrders / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Error fetching orders', error: message });
  }
};

// Update order status (for admins)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Validate the new status
  if (!status || !Object.values(OrderStatus).includes(status)) {
    return res.status(400).json({ 
      message: 'Invalid status. Must be one of: processing, delivered, completed' 
    });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status },
      include: { items: true, user: { select: { id: true, name: true } } },
    });

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Error updating order status', error: message });
  }
};
