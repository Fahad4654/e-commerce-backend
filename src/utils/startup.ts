
import { hash } from 'bcryptjs';
import prisma from '../db/prisma';

export const createAdminUserIfNotExists = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminPhone = process.env.ADMIN_PHONE;

  if (!adminEmail || !adminPassword || !adminPhone) {
    console.warn(
      'Skipping admin creation. Please set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_PHONE in your .env file'
    );
    return;
  }

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const hashedPassword = await hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        phone: adminPhone,
        role: 'admin',
        address: 'Admin Address', // You can make this configurable if needed
        cart: {
          create: {},
        },
      },
    });
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};
