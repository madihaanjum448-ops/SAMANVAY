import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

const roleErrorMessages = {
  district_eoc: 'Invalid District EOC credentials.',
  agency_admin: 'Invalid Rescue Agency credentials.',
  state_authority: 'Invalid credentials. Please try again.'
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, role: requestedRole } = req.body;

  const user = store.data.users.find(u => u.email === email && u.password === password);

  if (!user) {
    const error = requestedRole && roleErrorMessages[requestedRole]
      ? roleErrorMessages[requestedRole]
      : 'Invalid credentials. Please try again.';
    return res.status(401).json({ success: false, error });
  }

  if (requestedRole && user.role !== requestedRole) {
    const error = roleErrorMessages[requestedRole] || 'Invalid credentials for selected role.';
    return res.status(401).json({ success: false, error });
  }

  const { password: _pw, ...safeUser } = user;

  return res.json({
    success: true,
    user: safeUser,
    token: `samanvay_jwt_${Buffer.from(JSON.stringify(safeUser)).toString('base64')}`
  });
});

// GET /api/auth/profile
router.get('/profile', (req, res) => {
  res.json({
    user: store.data.users[0]
  });
});

export default router;
