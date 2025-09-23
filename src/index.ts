
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
