import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/activity
router.get('/', (req, res) => {
  res.json({
    activity: store.getActivityLogs()
  });
});

// GET /api/notifications
router.get('/notifications', (req, res) => {
  res.json({
    notifications: store.getNotifications()
  });
});

export default router;
