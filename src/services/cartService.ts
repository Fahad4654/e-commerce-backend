
import prisma from '../db/prisma';

// Get the user's cart
export const getCart = async (userId: number) => {
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

  return cart;
};

// Add an item to the cart
export const addItemToCart = async (userId: number, productId: number, quantity: number) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new Error('Product not found');
  }

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  let cartItem;
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) {
      throw new Error('Not enough stock available');
    }
    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    if (product.stock < quantity) {
      throw new Error('Not enough stock available');
    }
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  return cartItem;
};

// Update a cart item
export const updateCartItem = async (userId: number, itemId: number, quantity: number) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
        throw new Error('Cart not found');
    }

    const cartItem = await prisma.cartItem.findFirst({
        where: {
            id: itemId,
            cartId: cart.id,
        },
        include: { product: true },
    });

    if (!cartItem) {
        throw new Error('Cart item not found');
    }

    if (cartItem.product.stock < quantity) {
        throw new Error('Not enough stock available');
    }

    const updatedItem = await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
    });

    return updatedItem;
}

// Remove an item from the cart
export const removeCartItem = async (userId: number, itemId: number) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
        throw new Error('Cart not found');
    }

    const cartItem = await prisma.cartItem.findFirst({
        where: {
            id: itemId,
            cartId: cart.id,
        },
    });

    if (!cartItem) {
        throw new Error('Cart item not found');
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
}
