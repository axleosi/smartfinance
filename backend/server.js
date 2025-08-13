import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'
import path from 'path';
import receiptRoutes from './routes/receiptRoutes.js'
import logRoutes from './routes/logRoutes.js'
import accountRoutes from './routes/accountRoutes.js'
import winningRoutes from './routes/winningReceiptCheck.js'
import visitRoutes from './routes/trackVisitRoutes.js'
import shareRoutes from './routes/shareRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(
  cors({
    origin: 'https://smartfinance-three.vercel.app',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
const MONGO_URI= process.env.MONGO_URI

app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/logs', logRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/', winningRoutes)
app.use('/api/referrals', visitRoutes)
app.use('/api/referrals', shareRoutes)
app.use('/api/admin', adminRoutes)



const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Database connected');
    });

    await mongoose.connect(`${MONGO_URI}/smartfinance`);

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Connection error:', error);
  }
};

await connectDB()

app.listen(PORT,()=>{console.log(`Server running on port ${PORT}`);
})