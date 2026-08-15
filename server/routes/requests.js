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
    const { 
      type, from, fromName, to, toName, incident, incidentLabel, 
      required, urgency, message, fromState, fromDistrict, targetState 
    } = req.body;

    if (!from || (!to && type !== 'escalated') || !required) {
      return res.status(400).json({ error: 'from, to (for direct requests), and required capability fields are mandatory' });
    }

    const isEscalated = type === 'escalated';
    const newRequest = await store.addRequest({
      type: type || 'direct',
      from,
      fromName: fromName || store.getAgencyById(from)?.name || from,
      to: to || null,
      toName: toName || (to ? (store.getAgencyById(to)?.name || to) : 'State/National EOC Review'),
      incident: incident || null,
      incidentLabel: incidentLabel || (incident ? `Incident ${incident}` : 'General Coordinate Action'),
      required,
      urgency: urgency || 'HIGH',
      message: message || 'Urgent inter-state disaster assistance requested.',
      fromState: fromState || '',
      fromDistrict: fromDistrict || '',
      targetState: targetState || '',
      status: isEscalated ? 'PENDING_APPROVAL' : 'INITIATED',
      approvedBy: null,
      approvedAt: null
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
    const { status, actor, updates } = req.body; // 'ACKNOWLEDGED' | 'DEPLOYED' | 'RESOLVED' | 'APPROVED' | 'REJECTED'
    if (!['ACKNOWLEDGED', 'DEPLOYED', 'RESOLVED', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    const updatedRequest = await store.updateRequestStatus(req.params.id, status, actor, updates);
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
