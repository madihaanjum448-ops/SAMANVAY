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
    const { type, location, district, severity, coordinates, affectedPopulation, requiredResources, description } = req.body;

    const newIncident = await store.addIncident({
      type: type || 'General Emergency',
      location: location || 'District Emergency Zone',
      district: district || 'Pune',
      severity: severity || 'HIGH',
      coordinates: coordinates || [18.5204, 73.8567],
      affectedPopulation: Number(affectedPopulation) || 1000,
      requiredResources: requiredResources || { boats: 2, ambulances: 2, personnel: 20, drones: 1 },
      assignedAgencies: [],
      description: description || 'Active emergency situation requiring multi-agency coordination.'
    });

    res.status(201).json({
      success: true,
      incident: newIncident
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
