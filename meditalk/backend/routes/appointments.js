import { Router } from 'express';
import { query } from '../database/db.js';

const router = Router();

function mapAppt(r) {
  return {
    id: r.id, patientId: r.patient_id, patientName: r.patient_name,
    doctorId: r.doctor_id, doctorName: r.doctor_name, specialty: r.specialty,
    date: r.date, time: r.time, type: r.type, status: r.status, reason: r.reason,
  };
}

router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId, status, date, specialty, type } = req.query;
    let sql = 'SELECT * FROM appointments';
    const conditions = []; const params = []; let idx = 1;
    if (patientId) { conditions.push('patient_id = $' + idx++); params.push(patientId); }
    if (doctorId) { conditions.push('doctor_id = $' + idx++); params.push(doctorId); }
    if (status) { conditions.push('status = $' + idx++); params.push(status); }
    if (date) { conditions.push('date = $' + idx++); params.push(date); }
    if (specialty) { conditions.push('specialty = $' + idx++); params.push(specialty); }
    if (type) { conditions.push('type = $' + idx++); params.push(type); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY date DESC, time ASC';
    const { rows } = await query(sql, params);
    res.json(rows.map(mapAppt));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch appointments' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Appointment not found' });
    res.json(mapAppt(rows[0]));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch appointment' }); }
});

router.post('/', async (req, res) => {
  try {
    const { patientId, patientName, doctorId, doctorName, specialty, date, time, type, reason } = req.body;
    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ error: 'patientId, doctorId, date and time are required' });
    }
    const id = 'A-' + Date.now();
    await query(
      `INSERT INTO appointments (id, patient_id, patient_name, doctor_id, doctor_name, specialty, date, time, type, status, reason) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'upcoming',$10)`,
      [id, patientId, patientName, doctorId, doctorName, specialty, date, time, type, reason]
    );
    try {
      await query(
        `INSERT INTO notifications (id, user_id, type, title, message, read) VALUES ($1,$2,'appointment_confirmed','Appointment Booked',$3,false)`,
        ['N-' + (Date.now()+1), patientId, `Your appointment with ${doctorName} on ${date} at ${time} has been booked.`]
      );
    } catch (_) {}
    const { rows } = await query('SELECT * FROM appointments WHERE id = $1', [id]);
    res.status(201).json({ success: true, appointment: mapAppt(rows[0]) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create appointment' }); }
});

router.patch('/:id/cancel', async (req, res) => {
  try {
    const { rowCount } = await query("UPDATE appointments SET status = 'cancelled' WHERE id = $1", [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to cancel appointment' }); }
});

router.patch('/:id/reschedule', async (req, res) => {
  try {
    const { date, time } = req.body;
    if (!date || !time) return res.status(400).json({ error: 'date and time are required' });
    const { rowCount } = await query("UPDATE appointments SET date = $1, time = $2, status = 'confirmed' WHERE id = $3", [date, time, req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to reschedule appointment' }); }
});

router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const { rowCount } = await query('UPDATE appointments SET status = $1 WHERE id = $2', [status, req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ success: true, id: req.params.id, status });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update appointment' }); }
});

export default router;
