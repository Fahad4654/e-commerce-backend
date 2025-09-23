
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import productRoutes from './routes/product'; // Import product routes

const app = express();

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/products', productRoutes); // Add product routes

app.get('/', (req, res) => {
  res.send('API is running...');
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
