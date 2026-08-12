import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/resources (aggregated across district)
router.get('/', (req, res) => {
  res.json({
    resources: store.getResources()
  });
});

export default router;
