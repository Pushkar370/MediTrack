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

    // Notify both Patient and Doctor
    try {
      await query(
        `INSERT INTO notifications (id, user_id, type, title, message, read) VALUES ($1,$2,'appointment_confirmed','Appointment Booked',$3,false)`,
        ['N-' + Date.now(), patientId, `Your appointment with ${doctorName || 'Doctor'} on ${date} at ${time} is scheduled.`]
      );
      await query(
        `INSERT INTO notifications (id, user_id, type, title, message, read) VALUES ($1,$2,'appointment_confirmed','New Patient Appointment',$3,false)`,
        ['N-' + (Date.now() + 1), doctorId, `New appointment booked by ${patientName || 'Patient'} on ${date} at ${time}.`]
      );
      await query(
        `INSERT INTO audit_logs (user_id, user_name, role, action, entity_type, entity_id, status)
         VALUES ($1, $2, 'Patient', 'Booked appointment with ' || $3, 'Appointment', $4, 'success')`,
        [patientId, patientName || 'Patient', doctorName || 'Doctor', id]
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

    try {
      const { rows } = await query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
      if (rows[0]) {
        const a = rows[0];
        await query(
          `INSERT INTO notifications (id, user_id, type, title, message, read) VALUES ($1,$2,'appointment_cancelled','Appointment Cancelled',$3,false)`,
          ['N-' + Date.now(), a.patient_id, `Your appointment on ${a.date} at ${a.time} has been cancelled.`]
        );
        await query(
          `INSERT INTO notifications (id, user_id, type, title, message, read) VALUES ($1,$2,'appointment_cancelled','Appointment Cancelled',$3,false)`,
          ['N-' + (Date.now() + 1), a.doctor_id, `Appointment with ${a.patient_name} on ${a.date} has been cancelled.`]
        );
        await query(
          `INSERT INTO audit_logs (user_id, user_name, role, action, entity_type, entity_id, status)
           VALUES ($1, $2, 'User', 'Cancelled appointment', 'Appointment', $3, 'success')`,
          [a.patient_id, a.patient_name, req.params.id]
        );
      }
    } catch (_) {}

    res.json({ success: true, id: req.params.id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to cancel appointment' }); }
});

router.patch('/:id/reschedule', async (req, res) => {
  try {
    const { date, time } = req.body;
    if (!date || !time) return res.status(400).json({ error: 'date and time are required' });
    const { rowCount } = await query("UPDATE appointments SET date = $1, time = $2, status = 'confirmed' WHERE id = $3", [date, time, req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Appointment not found' });

    try {
      const { rows } = await query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
      if (rows[0]) {
        const a = rows[0];
        await query(
          `INSERT INTO notifications (id, user_id, type, title, message, read) VALUES ($1,$2,'appointment_confirmed','Appointment Rescheduled',$3,false)`,
          ['N-' + Date.now(), a.patient_id, `Your appointment has been rescheduled to ${date} at ${time}.`]
        );
        await query(
          `INSERT INTO notifications (id, user_id, type, title, message, read) VALUES ($1,$2,'appointment_confirmed','Appointment Rescheduled',$3,false)`,
          ['N-' + (Date.now() + 1), a.doctor_id, `Appointment with ${a.patient_name} rescheduled to ${date} at ${time}.`]
        );
        await query(
          `INSERT INTO audit_logs (user_id, user_name, role, action, entity_type, entity_id, status)
           VALUES ($1, $2, 'User', 'Rescheduled appointment', 'Appointment', $3, 'success')`,
          [a.patient_id, a.patient_name, req.params.id]
        );
      }
    } catch (_) {}

    res.json({ success: true, id: req.params.id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to reschedule appointment' }); }
});

router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const { rowCount } = await query('UPDATE appointments SET status = $1 WHERE id = $2', [status, req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Appointment not found' });

    try {
      const { rows } = await query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
      if (rows[0]) {
        const a = rows[0];
        await query(
          `INSERT INTO notifications (id, user_id, type, title, message, read) VALUES ($1,$2,'appointment_confirmed','Appointment Updated',$3,false)`,
          ['N-' + Date.now(), a.patient_id, `Your appointment status is now: ${status}.`]
        );
        await query(
          `INSERT INTO audit_logs (user_id, user_name, role, action, entity_type, entity_id, status)
           VALUES ($1, $2, 'Doctor', 'Updated appointment status to ' || $3, 'Appointment', $4, 'success')`,
          [a.doctor_id, a.doctor_name, status, req.params.id]
        );
      }
    } catch (_) {}

    res.json({ success: true, id: req.params.id, status });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update appointment' }); }
});

export default router;
