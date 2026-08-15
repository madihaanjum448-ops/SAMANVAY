import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = store.data.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid official credentials. Please try again.'
    });
  }

  return res.json({
    success: true,
    user,
    token: `samanvay_jwt_${Buffer.from(JSON.stringify(user)).toString('base64')}`
  });
});

// GET /api/auth/profile
router.get('/profile', (req, res) => {
  res.json({
    user: store.data.users[0]
  });
});

export default router;
