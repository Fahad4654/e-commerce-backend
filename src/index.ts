
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import productRoutes from './routes/product'; // Import product routes
import orderRoutes from './routes/order'; // Import order routes
import cartRoutes from './routes/cart'; // Import cart routes
import { createAdminUserIfNotExists } from './utils/startup';
import { guestMiddleware } from './middleware/guestMiddleware';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(guestMiddleware);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/products', productRoutes); // Add product routes
app.use('/api/orders', orderRoutes); // Add order routes
app.use('/api/cart', cartRoutes); // Add cart routes

app.get('/', (req, res) => {
  res.send('API is running...');
});

const port = parseInt(process.env.PORT || '3000');

// Create admin user on startup
createAdminUserIfNotExists()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to create admin user:', error);
    process.exit(1);
  });
