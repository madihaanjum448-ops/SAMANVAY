import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/agencies
router.get('/', (req, res) => {
  const { verificationStatus, district, type, status } = req.query;
  const agencies = store.getAgencies({ verificationStatus, district, type, status });
  res.json({
    count: agencies.length,
    agencies
  });
});

// GET /api/agencies/:id
router.get('/:id', (req, res) => {
  const agency = store.getAgencyById(req.params.id);
  if (!agency) {
    return res.status(404).json({ error: 'Agency not found' });
  }
  res.json({ agency });
});

// POST /api/agencies/register
router.post('/register', async (req, res) => {
  try {
    const { name, type, district, state, phone, email, expertise, location, resources } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Agency name and type are required' });
    }

    const newAgency = await store.addAgency({
      name,
      type,
      district: district || 'Pune',
      state: state || 'Maharashtra',
      phone: phone || '+91-00-00000000',
      email: email || 'contact@agency.gov.in',
      status: 'AVAILABLE',
      coordinates: location?.lat && location?.lng 
        ? [parseFloat(location.lat), parseFloat(location.lng)]
        : [18.5204, 73.8567],
      address: location?.address || 'District Campus',
      expertise: Array.isArray(expertise) ? expertise : [],
      resources: {
        personnel: { total: Number(resources?.personnel) || 0, available: Number(resources?.personnel) || 0 },
        ambulances: { total: Number(resources?.ambulances) || 0, available: Number(resources?.ambulances) || 0 },
        rescueVehicles: { total: Number(resources?.vehicles) || 0, available: Number(resources?.vehicles) || 0 },
        boats: { total: Number(resources?.boats) || 0, available: Number(resources?.boats) || 0 },
        drones: { total: Number(resources?.drones) || 0, available: Number(resources?.drones) || 0 },
        medicalKits: { total: Number(resources?.kits) || 0, available: Number(resources?.kits) || 0 },
      },
      about: `Registered disaster rescue agency operating in ${district || 'Pune'} jurisdiction.`
    });

    res.status(201).json({
      success: true,
      message: 'Agency registration received and queued for District Authority verification',
      agency: newAgency
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/agencies/:id/verify
router.patch('/:id/verify', async (req, res) => {
  try {
    const { status, verifierName } = req.body; // 'VERIFIED' | 'REJECTED'
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be VERIFIED or REJECTED' });
    }

    const updatedAgency = await store.verifyAgency(
      req.params.id, 
      status, 
      verifierName || 'District Collector / EOC Authority'
    );

    if (!updatedAgency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    res.json({
      success: true,
      message: `Agency ${status.toLowerCase()} successfully`,
      agency: updatedAgency
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/agencies/:id/resources
router.patch('/:id/resources', async (req, res) => {
  try {
    const { resources } = req.body;
    const updatedAgency = await store.updateAgencyResources(req.params.id, resources);
    if (!updatedAgency) {
      return res.status(404).json({ error: 'Agency not found' });
    }
    res.json({
      success: true,
      agency: updatedAgency
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
