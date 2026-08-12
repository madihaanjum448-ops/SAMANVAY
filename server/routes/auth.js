import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, role, district } = req.body;

  // Simple tokenless/lightweight simulation login for authority & agency
  const user = store.data.users.find(u => u.email === email) || {
    id: `USR-${Date.now()}`,
    name: email ? email.split('@')[0].toUpperCase() : 'Commander',
    email: email || 'user@samanvay.gov.in',
    role: role || 'authority',
    district: district || 'Pune',
    state: 'Maharashtra'
  };

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
