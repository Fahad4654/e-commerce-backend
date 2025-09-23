
// src/controllers/orderController.ts

import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { shippingAddress, phone, paymentMethod, shippingMethod } = req.body;
  const userId = req.user.id;

  if (!shippingAddress || !phone || !paymentMethod || !shippingMethod) {
    return res.status(400).json({ 
      message: 'Shipping address, phone, payment method, and shipping method are required' 
    });
  }

  try {
    // Start a transaction to ensure atomicity
    const newOrder = await prisma.$transaction(async (prisma) => {
      // 1. Find the user's cart and include the cart items and product details
      const userCart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!userCart || userCart.items.length === 0) {
        throw new Error('Your cart is empty. Add items before creating an order.');
      }

      // 2. Calculate the total price of the order
      const total = userCart.items.reduce((acc, item) => {
        return acc + item.quantity * item.product.price;
      }, 0);

      // 3. Create the order
      const order = await prisma.order.create({
        data: {
          userId,
          total,
          shippingAddress,
          phone,
          paymentMethod,
          shippingMethod,
          items: {
            create: userCart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: true, // Include order items in the response
        },
      });

      // 4. Clear the user's cart by deleting all cart items
      await prisma.cartItem.deleteMany({
        where: { cartId: userCart.id },
      });

      return order;
    });

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message || 'Error creating order' });
    }
    res.status(500).json({ message: 'Error creating order', error });
  }
};
