import { Router } from 'express';
import { getDb } from '../database/db.js';

const router = Router();

// GET /api/doctors
router.get('/', async (req, res) => {
  try {
    const pool = await getDb();
    const { status, specialty, search } = req.query;
    let query = 'SELECT * FROM doctors';
    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (specialty) {
      params.push(specialty);
      conditions.push(`specialty = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      const p1 = params.length;
      params.push(`%${search}%`);
      const p2 = params.length;
      conditions.push(`(name ILIKE $${p1} OR specialty ILIKE $${p2})`);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = await getDb();
    const result = await pool.query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// POST /api/doctors
router.post('/', async (req, res) => {
  try {
    const pool = await getDb();
    const { name, email, phone, specialty, experience = 0, availability = 'Available', status = 'active', bio = '' } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    const id = `D-${Date.now()}`;
    await pool.query(`
      INSERT INTO doctors (id, name, email, phone, specialty, experience, availability, status, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [id, name, email, phone, specialty, experience, availability, status, bio]);

    const result = await pool.query('SELECT * FROM doctors WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

// PUT /api/doctors/:id
router.put('/:id', async (req, res) => {
  try {
    const pool = await getDb();
    const { id } = req.params;
    const existingRes = await pool.query('SELECT * FROM doctors WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    const existing = existingRes.rows[0];

    const {
      name = existing.name, email = existing.email, phone = existing.phone,
      specialty = existing.specialty, experience = existing.experience,
      availability = existing.availability,
      status = existing.status, bio = existing.bio,
    } = req.body;

    await pool.query(`
      UPDATE doctors SET name=$1, email=$2, phone=$3, specialty=$4, experience=$5, availability=$6, status=$7, bio=$8
      WHERE id=$9
    `, [name, email, phone, specialty, experience, availability, status, bio, id]);

    const updatedRes = await pool.query('SELECT * FROM doctors WHERE id = $1', [id]);
    res.json(updatedRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

// PATCH /api/doctors/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const pool = await getDb();
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const result = await pool.query('UPDATE doctors SET status = $1 WHERE id = $2', [status, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ success: true, id: req.params.id, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
