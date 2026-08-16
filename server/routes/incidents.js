import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/incidents
router.get('/', (req, res) => {
  res.json({
    incidents: store.getIncidents()
  });
});

// GET /api/incidents/:id
router.get('/:id', (req, res) => {
  const incident = store.getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json({ incident });
});

// POST /api/incidents
router.post('/', async (req, res) => {
  try {
    const {
      type,
      location,
      district,
      state,
      severity,
      description,
      coordinates,
      reportedBy,
      affectedPopulation,
      requiredResources
    } = req.body;

    if (!type || !location || !severity || !description) {
      return res.status(400).json({ error: 'Missing required incident fields.' });
    }

    const newIncident = await store.addIncident({
      type,
      location,
      district: district || 'Pune',
      state: state || 'Maharashtra',
      severity,
      description,
      coordinates: coordinates || [18.5204, 73.8567],
      reportedBy: reportedBy || 'District EOC',
      affectedPopulation: Number(affectedPopulation) || 0,
      requiredResources: requiredResources || { boats: 0, ambulances: 0, personnel: 0, drones: 0 },
      assignedAgencies: []
    });

    res.status(201).json({
      success: true,
      incident: newIncident
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/incidents/:id/resolve
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { actor } = req.body;
    const incident = await store.resolveIncident(req.params.id, actor || 'District EOC');
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/incidents/:id
router.delete('/:id', async (req, res) => {
  try {
    const actor = req.query.actor || 'District EOC';
    const incident = await store.deleteIncident(req.params.id, actor);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
