import { Router } from 'express';
import { getDb } from '../database/db.js';

const router = Router();

// Helper to parse JSON fields safely
function parsePatient(row) {
  if (!row) return null;
  return {
    ...row,
    bloodGroup: row.blood_group,
    allergies: typeof row.allergies === 'string' ? JSON.parse(row.allergies) : (row.allergies || []),
    chronicConditions: typeof row.chronic_conditions === 'string' ? JSON.parse(row.chronic_conditions) : (row.chronic_conditions || []),
    currentMedications: typeof row.current_medications === 'string' ? JSON.parse(row.current_medications) : (row.current_medications || []),
    emergencyContact: typeof row.emergency_contact === 'string' ? JSON.parse(row.emergency_contact) : (row.emergency_contact || {}),
    insurance: typeof row.insurance === 'string' ? JSON.parse(row.insurance) : (row.insurance || {}),
    registeredAt: row.registered_at,
  };
}

// GET /api/patients
router.get('/', async (req, res) => {
  try {
    const pool = await getDb();
    const { status, search } = req.query;
    let query = 'SELECT * FROM patients';
    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      const p1 = params.length;
      params.push(`%${search}%`);
      const p2 = params.length;
      conditions.push(`(name ILIKE $${p1} OR id ILIKE $${p2})`);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY registered_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows.map(parsePatient));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET /api/patients/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = await getDb();
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(parsePatient(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// POST /api/patients
router.post('/', async (req, res) => {
  try {
    const pool = await getDb();
    const { name, email, phone, dob, gender, address, bloodGroup, height, weight,
      allergies = [], chronicConditions = [], currentMedications = [],
      emergencyContact = {}, insurance = {}, status = 'active' } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    const id = `P-${Date.now()}`;
    await pool.query(`
      INSERT INTO patients (id, name, email, phone, dob, gender, address, blood_group, height, weight,
        allergies, chronic_conditions, current_medications, emergency_contact, insurance, status, registered_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
    `, [id, name, email, phone, dob, gender, address, bloodGroup, height, weight,
      JSON.stringify(allergies), JSON.stringify(chronicConditions), JSON.stringify(currentMedications),
      JSON.stringify(emergencyContact), JSON.stringify(insurance), status]);

    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    res.status(201).json(parsePatient(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// PUT /api/patients/:id
router.put('/:id', async (req, res) => {
  try {
    const pool = await getDb();
    const { id } = req.params;
    const existingRes = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    const existing = existingRes.rows[0];

    const {
      name = existing.name, email = existing.email, phone = existing.phone,
      dob = existing.dob, gender = existing.gender, address = existing.address,
      bloodGroup = existing.blood_group, height = existing.height, weight = existing.weight,
      allergies, chronicConditions, currentMedications, emergencyContact, insurance, status = existing.status,
    } = req.body;

    await pool.query(`
      UPDATE patients SET name=$1, email=$2, phone=$3, dob=$4, gender=$5, address=$6, blood_group=$7, height=$8, weight=$9,
        allergies=$10, chronic_conditions=$11, current_medications=$12, emergency_contact=$13, insurance=$14, status=$15
      WHERE id=$16
    `, [name, email, phone, dob, gender, address, bloodGroup, height, weight,
      JSON.stringify(allergies ?? existing.allergies),
      JSON.stringify(chronicConditions ?? existing.chronic_conditions),
      JSON.stringify(currentMedications ?? existing.current_medications),
      JSON.stringify(emergencyContact ?? existing.emergency_contact),
      JSON.stringify(insurance ?? existing.insurance),
      status, id]);

    const updatedRes = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    res.json(parsePatient(updatedRes.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// PATCH /api/patients/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const pool = await getDb();
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const result = await pool.query('UPDATE patients SET status = $1 WHERE id = $2', [status, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json({ success: true, id: req.params.id, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
