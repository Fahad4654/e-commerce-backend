
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth';
import productRoutes from './src/routes/product';
import protectedRoutes from './src/routes/protected';
import { logRoutes } from './src/utils/routeLogger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Mount the routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/protected', protectedRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  logRoutes('/auth', authRoutes);
  logRoutes('/products', productRoutes);
  logRoutes('/protected', protectedRoutes);
});
