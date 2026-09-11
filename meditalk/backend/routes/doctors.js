import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../database/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/doctors — all authenticated users (needed for appointment booking)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, specialty, search } = req.query;
    let sql = 'SELECT * FROM doctors';
    const conditions = [];
    const params = [];
    let idx = 1;
    if (status && status !== 'all') { conditions.push('status = $' + idx++); params.push(status); }
    if (specialty) { conditions.push('specialty = $' + idx++); params.push(specialty); }
    if (search) { conditions.push('(name ILIKE $' + idx + ' OR specialty ILIKE $' + (idx+1) + ')'); params.push('%'+search+'%','%'+search+'%'); idx += 2; }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY name ASC';
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch doctors' }); }
});

// GET /api/doctors/:id — all authenticated users
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Doctor not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch doctor' }); }
});

// POST /api/doctors — admin only
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, phone, specialty, experience = 0, availability = 'Available', status = 'active', bio = '' } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const id = 'D-' + Date.now();
    await query(
      'INSERT INTO doctors (id, name, email, phone, specialty, experience, availability, status, bio) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [id, name, email, phone, specialty, experience, availability, status, bio]
    );

    if (email) {
      try {
        const hash = bcrypt.hashSync('password', 10);
        await query(
          'INSERT INTO users (id, name, email, password, role, doctor_id) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO NOTHING',
          ['U-' + id, name, email, hash, 'doctor', id]
        );
      } catch (_) {}
    }

    try {
      await query(
        `INSERT INTO audit_logs (user_id, user_name, role, action, entity_type, entity_id, status)
         VALUES ($1, $2, 'Administrator', 'Added new doctor to directory', 'Doctor', $3, 'success')`,
        ['ADMIN', name, id]
      );
    } catch (_) {}

    const { rows } = await query('SELECT * FROM doctors WHERE id = $1', [id]);
    res.status(201).json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create doctor' }); }
});

// PUT /api/doctors/:id — admin only
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: ex } = await query('SELECT * FROM doctors WHERE id = $1', [id]);
    if (!ex[0]) return res.status(404).json({ error: 'Doctor not found' });
    const e = ex[0];
    const { name=e.name, email=e.email, phone=e.phone, specialty=e.specialty, experience=e.experience, availability=e.availability, status=e.status, bio=e.bio } = req.body;
    await query(
      'UPDATE doctors SET name=$1,email=$2,phone=$3,specialty=$4,experience=$5,availability=$6,status=$7,bio=$8 WHERE id=$9',
      [name, email, phone, specialty, experience, availability, status, bio, id]
    );

    // Sync doctor changes across appointments, prescriptions, and users
    try {
      if (name || specialty) {
        await query('UPDATE appointments SET doctor_name = COALESCE($1, doctor_name), specialty = COALESCE($2, specialty) WHERE doctor_id = $3', [name, specialty, id]);
        await query('UPDATE prescriptions SET doctor_name = COALESCE($1, doctor_name) WHERE doctor_id = $2', [name, id]);
      }
      if (name) {
        await query('UPDATE users SET name = $1 WHERE doctor_id = $2', [name, id]);
      }
      if (email) {
        await query('UPDATE users SET email = $1 WHERE doctor_id = $2', [email, id]);
      }
      await query(
        `INSERT INTO audit_logs (user_id, user_name, role, action, entity_type, entity_id, status)
         VALUES ($1, $2, 'Administrator', 'Updated doctor details', 'Doctor', $3, 'success')`,
        ['ADMIN', name, id]
      );
    } catch (_) {}

    const { rows: updated } = await query('SELECT * FROM doctors WHERE id = $1', [id]);
    res.json(updated[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update doctor' }); }
});

// PATCH /api/doctors/:id/status — admin only
router.patch('/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const { rowCount } = await query('UPDATE doctors SET status = $1 WHERE id = $2', [status, req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ success: true, id: req.params.id, status });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update status' }); }
});

export default router;
