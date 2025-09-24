
import prisma from '../db/prisma';
import { Prisma } from '@prisma/client';

const getCart = async (identifier: number | string) => {
  const where = typeof identifier === 'number' ? { userId: identifier } : { guestId: identifier };
  const cart = await prisma.cart.findFirst({
    where,
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

const createCart = async (identifier: number | string) => {
    const data: Prisma.CartUncheckedCreateInput = typeof identifier === 'number'
      ? { userId: identifier }
      : { guestId: identifier };
    const newCart = await prisma.cart.create({ data });


    return {
        ...newCart,
        items: [],
    }
  };

const addItemToCart = async (identifier: number | string, productId: number, quantity: number) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new Error('Product not found');
  }

  let cart = await getCart(identifier);
  if (!cart) {
    cart = await createCart(identifier);
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

const updateCartItem = async (identifier: number | string, itemId: number, quantity: number) => {
    const cart = await getCart(identifier);
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

const removeCartItem = async (identifier: number | string, itemId: number) => {
    const cart = await getCart(identifier);
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


export {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
  };
