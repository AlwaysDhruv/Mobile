import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config.js';

export default async function auth(req, res, next) {
  try {
    const h = req.headers.authorization;
    if (!h) return res.status(401).json({ message: 'No token' });
    const [type, token] = h.split(' ');
    if (type !== 'Bearer' || !token) return res.status(401).json({ message: 'Invalid auth format' });
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
