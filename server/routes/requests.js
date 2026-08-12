import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/requests
router.get('/', (req, res) => {
  const { from, to, status, incident } = req.query;
  const requests = store.getRequests({ from, to, status, incident });
  res.json({
    count: requests.length,
    requests
  });
});

// GET /api/requests/:id
router.get('/:id', (req, res) => {
  const request = store.getRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  res.json({ request });
});

// POST /api/requests (CAP-Lite Dispatch)
router.post('/', async (req, res) => {
  try {
    const { from, fromName, to, toName, incident, incidentLabel, required, urgency, message } = req.body;

    if (!from || !to || !required) {
      return res.status(400).json({ error: 'from, to, and required capability fields are mandatory' });
    }

    const newRequest = await store.addRequest({
      from,
      fromName: fromName || store.getAgencyById(from)?.name || from,
      to,
      toName: toName || store.getAgencyById(to)?.name || to,
      incident: incident || null,
      incidentLabel: incidentLabel || (incident ? `Incident ${incident}` : 'Direct Tasking'),
      required,
      urgency: urgency || 'HIGH',
      message: message || 'Urgent inter-agency disaster assistance requested.'
    });

    res.status(201).json({
      success: true,
      message: 'Coordination request dispatched successfully',
      request: newRequest
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, actor } = req.body; // 'ACKNOWLEDGED' | 'DEPLOYED' | 'RESOLVED'
    if (!['ACKNOWLEDGED', 'DEPLOYED', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    const updatedRequest = await store.updateRequestStatus(req.params.id, status, actor);
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({
      success: true,
      message: `Request transitioned to ${status}`,
      request: updatedRequest
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
