import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { config } from './config.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import contactRoutes from './routes/contact.js';
import sellerStatsRoutes from "./routes/sellerStats.js";
import storeRoutes from "./routes/StoreRoutes.js";
import mailRoutes from "./routes/mailRoutes.js";
import riderStatsRoutes from "./routes/riderStats.js";
import cartRoutes from "./routes/cartRoutes.js";
import storeRiderRoutes from './routes/storeRiderRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>res.json({ ok: true, service: 'mobileshop-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rider-store', storeRiderRoutes);
app.use('/api/contact', contactRoutes);
app.use("/api/seller", sellerStatsRoutes);
app.use('/uploads', express.static('public/uploads'));
app.use("/api/mail", mailRoutes);
app.use("/api/rider/stats", riderStatsRoutes);
app.use("/api/orders", cartRoutes);
app.use("/api/store", storeRoutes);
app.use("/uploads", express.static("uploads"));

async function start() {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('Connected to MongoDB');
    app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
}
start();
