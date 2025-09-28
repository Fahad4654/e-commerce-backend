
import prisma from '../db/prisma';
import { Prisma } from '@prisma/client';

const getCart = async (userId?: number, guestId?: string) => {
    if (!userId && !guestId) {
        return null;
    }

    const where: Prisma.CartWhereInput = {};
    if (userId) {
        where.userId = userId;
    } else {
        where.guestId = guestId;
    }

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

const createCart = async (userId?: number, guestId?: string) => {
    if (!userId && !guestId) {
        throw new Error("Either a userId or guestId must be provided");
    }

    const data: Prisma.CartUncheckedCreateInput = userId ? { userId } : { guestId: guestId! };
    const newCart = await prisma.cart.create({ data });


    return {
        ...newCart,
        items: [],
    }
  };

const addItemToCart = async (userId: number | undefined, guestId: string | undefined, productId: number, quantity: number) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new Error('Product not found');
  }

  let cart = await getCart(userId, guestId);
  if (!cart) {
    cart = await createCart(userId, guestId);
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
      throw new Error('Insufficient stock');
    }
    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  return await getCart(userId, guestId);
};

const updateCartItem = async (userId: number | undefined, guestId: string | undefined, itemId: number, quantity: number) => {
    const cart = await getCart(userId, guestId);
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

    if (quantity > 0 && cartItem.product.stock < quantity) {
        throw new Error('Insufficient stock');
    }

    if (quantity <= 0) {
        await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
        await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });
    }


    return await getCart(userId, guestId);
}

const removeCartItem = async (userId: number | undefined, guestId: string | undefined, itemId: number) => {
    const cart = await getCart(userId, guestId);
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

    return await getCart(userId, guestId);
}


export {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
  };
