import { Router } from 'express';
import { getDb } from '../database/db.js';

const router = Router();

// GET /api/appointments?patientId=&doctorId=&status=&date=
router.get('/', async (req, res) => {
  try {
    const pool = await getDb();
    const { patientId, doctorId, status, date, specialty, type } = req.query;
    let query = 'SELECT * FROM appointments';
    const conditions = [];
    const params = [];

    if (patientId) { params.push(patientId); conditions.push(`patient_id = $${params.length}`); }
    if (doctorId) { params.push(doctorId); conditions.push(`doctor_id = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    if (date) { params.push(date); conditions.push(`date = $${params.length}`); }
    if (specialty) { params.push(specialty); conditions.push(`specialty = $${params.length}`); }
    if (type) { params.push(type); conditions.push(`type = $${params.length}`); }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY date DESC, time ASC';

    const result = await pool.query(query, params);
    
    // Map snake_case to camelCase for frontend compatibility
    const mapped = result.rows.map((r) => ({
      id: r.id,
      patientId: r.patient_id,
      patientName: r.patient_name,
      doctorId: r.doctor_id,
      doctorName: r.doctor_name,
      specialty: r.specialty,
      date: typeof r.date === 'object' && r.date !== null ? r.date.toISOString().split('T')[0] : r.date,
      time: r.time,
      type: r.type,
      status: r.status,
      reason: r.reason,
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET /api/appointments/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = await getDb();
    const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    const row = result.rows[0];
    res.json({
      id: row.id, patientId: row.patient_id, patientName: row.patient_name,
      doctorId: row.doctor_id, doctorName: row.doctor_name,
      specialty: row.specialty, date: typeof row.date === 'object' && row.date !== null ? row.date.toISOString().split('T')[0] : row.date, time: row.time,
      type: row.type, status: row.status, reason: row.reason,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// POST /api/appointments
router.post('/', async (req, res) => {
  try {
    const pool = await getDb();
    const { patientId, patientName, doctorId, doctorName, specialty, date, time, type, reason } = req.body;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ error: 'patientId, doctorId, date and time are required' });
    }

    const id = `A-${Date.now()}`;
    await pool.query(`
      INSERT INTO appointments (id, patient_id, patient_name, doctor_id, doctor_name, specialty, date, time, type, status, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'upcoming', $10)
    `, [id, patientId, patientName, doctorId, doctorName, specialty, date, time, type, reason]);

    // Add a notification for the patient
    pool.query(`INSERT INTO notifications (user_id, type, title, message, is_read)
      VALUES ($1, 'appointment_confirmed', 'Appointment Booked', $2, false)`,
      [patientId, `Your appointment with ${doctorName} on ${date} at ${time} has been booked.`]
    ).catch(() => {});

    const newRes = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
    const newAppt = newRes.rows[0];
    res.status(201).json({
      success: true,
      appointment: {
        id: newAppt.id, patientId: newAppt.patient_id, patientName: newAppt.patient_name,
        doctorId: newAppt.doctor_id, doctorName: newAppt.doctor_name,
        specialty: newAppt.specialty, date: typeof newAppt.date === 'object' && newAppt.date !== null ? newAppt.date.toISOString().split('T')[0] : newAppt.date, time: newAppt.time,
        type: newAppt.type, status: newAppt.status, reason: newAppt.reason,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PATCH /api/appointments/:id/cancel
router.patch('/:id/cancel', async (req, res) => {
  try {
    const pool = await getDb();
    const result = await pool.query("UPDATE appointments SET status = 'cancelled' WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// PATCH /api/appointments/:id/reschedule
router.patch('/:id/reschedule', async (req, res) => {
  try {
    const pool = await getDb();
    const { date, time } = req.body;
    if (!date || !time) return res.status(400).json({ error: 'date and time are required' });

    const result = await pool.query("UPDATE appointments SET date = $1, time = $2, status = 'confirmed' WHERE id = $3",
      [date, time, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

// PATCH /api/appointments/:id — general status update (e.g. complete)
router.patch('/:id', async (req, res) => {
  try {
    const pool = await getDb();
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    const result = await pool.query('UPDATE appointments SET status = $1 WHERE id = $2', [status, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ success: true, id: req.params.id, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

export default router;
