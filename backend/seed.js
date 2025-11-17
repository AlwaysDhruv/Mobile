import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import User from './models/User.js';
import Store from './models/Store.js';

async function run() {
  await mongoose.connect(config.mongoURI);
  console.log('Connected');

  const users = [
    { name: 'Alice Seller', email: 'seller@example.com', password: 'seller123', role: 'seller' },
    { name: 'Bob Buyer', email: 'buyer@example.com', password: 'buyer123', role: 'buyer' },
    { name: 'Ravi Rider', email: 'rider@example.com', password: 'rider123', role: 'rider' }
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      const user = await User.create({ name: u.name, email: u.email, passwordHash, role: u.role });
      console.log('Created', u.email);
      if (u.role === 'seller') {
        await Store.create({ seller: user._id, storeName: `${user.name}'s Store` });
        console.log('Created store for', u.email);
      }
    } else {
      console.log('Skipped', u.email);
    }
  }
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
