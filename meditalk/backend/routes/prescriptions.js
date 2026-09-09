import { Router } from 'express';
import { getDb } from '../database/db.js';

const router = Router();

// ===== PRESCRIPTIONS =====

function parsePrescription(row) {
  if (!row) return null;
  return {
    ...row,
    patientId: row.patient_id,
    patientName: row.patient_name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    additionalInstructions: row.additional_instructions,
    medications: typeof row.medications === 'string' ? JSON.parse(row.medications) : (row.medications || []),
  };
}

// GET /api/prescriptions
router.get('/prescriptions', async (req, res) => {
  try {
    const pool = await getDb();
    const { patientId, doctorId } = req.query;
    let query = 'SELECT * FROM prescriptions';
    const conditions = [];
    const params = [];

    if (patientId) { params.push(patientId); conditions.push(`patient_id = $${params.length}`); }
    if (doctorId) { params.push(doctorId); conditions.push(`doctor_id = $${params.length}`); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows.map(parsePrescription));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// GET /api/prescriptions/:id
router.get('/prescriptions/:id', async (req, res) => {
  try {
    const pool = await getDb();
    const result = await pool.query('SELECT * FROM prescriptions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Prescription not found' });
    res.json(parsePrescription(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// POST /api/prescriptions
router.post('/prescriptions', async (req, res) => {
  try {
    const pool = await getDb();
    const { patientId, patientName, doctorId, doctorName, medications = [], additionalInstructions = '', status = 'active' } = req.body;
    if (!patientId || !doctorId) return res.status(400).json({ error: 'patientId and doctorId are required' });

    // Get patient & doctor names if not provided
    let finalPatientName = patientName;
    if (!finalPatientName) {
      const pRes = await pool.query('SELECT name FROM patients WHERE id = $1', [patientId]);
      finalPatientName = pRes.rows[0]?.name;
    }
    let finalDoctorName = doctorName;
    if (!finalDoctorName) {
      const dRes = await pool.query('SELECT name FROM doctors WHERE id = $1', [doctorId]);
      finalDoctorName = dRes.rows[0]?.name;
    }

    const result = await pool.query(`
      INSERT INTO prescriptions (patient_id, patient_name, doctor_id, doctor_name, medications, additional_instructions, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [patientId, finalPatientName, doctorId, finalDoctorName, JSON.stringify(medications), additionalInstructions, status]);

    // Add notification for the patient
    pool.query(`INSERT INTO notifications (user_id, type, title, message, is_read)
      VALUES ($1, 'prescription_available', 'New Prescription', $2, false)`,
      [patientId, `A new prescription has been issued for you.`]
    ).catch(() => {});

    res.status(201).json({ success: true, prescription: parsePrescription(result.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// ===== CONSULTATIONS =====

function parseConsultation(row) {
  if (!row) return null;
  return {
    ...row,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    diagnosisCode: row.diagnosis_code,
    labResults: row.lab_results,
    treatmentPlan: row.treatment_plan,
    followUpDate: typeof row.follow_up_date === 'object' && row.follow_up_date !== null ? row.follow_up_date.toISOString().split('T')[0] : row.follow_up_date,
    followUpInstructions: row.follow_up_instructions,
    vitals: typeof row.vitals === 'string' ? JSON.parse(row.vitals) : (row.vitals || {}),
  };
}

// GET /api/consultations
router.get('/consultations', async (req, res) => {
  try {
    const pool = await getDb();
    const { patientId, doctorId } = req.query;
    let query = 'SELECT * FROM consultations';
    const conditions = [];
    const params = [];

    if (patientId) { params.push(patientId); conditions.push(`patient_id = $${params.length}`); }
    if (doctorId) { params.push(doctorId); conditions.push(`doctor_id = $${params.length}`); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows.map(parseConsultation));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// POST /api/consultations
router.post('/consultations', async (req, res) => {
  try {
    const pool = await getDb();
    const {
      patientId, doctorId, reason, symptoms, vitals = {}, diagnosis, diagnosisCode,
      observations, labResults, treatmentPlan, followUpDate, followUpInstructions, status = 'completed',
      appointmentId,
    } = req.body;

    if (!patientId || !doctorId) return res.status(400).json({ error: 'patientId and doctorId are required' });

    const result = await pool.query(`
      INSERT INTO consultations (patient_id, doctor_id, reason, symptoms, vitals, diagnosis, diagnosis_code,
        observations, lab_results, treatment_plan, follow_up_date, follow_up_instructions, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
    `, [patientId, doctorId, reason, symptoms, JSON.stringify(vitals), diagnosis, diagnosisCode,
      observations, labResults, treatmentPlan, followUpDate, followUpInstructions, status]);

    // Also add a medical record entry
    try {
      const dRes = await pool.query('SELECT name FROM doctors WHERE id = $1', [doctorId]);
      const doctorName = dRes.rows[0]?.name || doctorId;
      
      const mrId = `MR-${Date.now()}`;
      await pool.query(`INSERT INTO medical_records (id, patient_id, type, date, doctor, description, status, details)
        VALUES ($1, $2, 'Consultation', CURRENT_TIMESTAMP, $3, $4, 'completed', $5)`,
        [mrId, patientId, doctorName, diagnosis || reason || 'Consultation',
        JSON.stringify({ symptoms: symptoms ? symptoms.split(',').map(s => s.trim()) : [], diagnosis, treatment: treatmentPlan, notes: observations })]);
    } catch (_) { /* non-critical */ }

    // Mark appointment as completed if provided
    if (appointmentId) {
      pool.query("UPDATE appointments SET status = 'completed' WHERE id = $1", [appointmentId]).catch(() => {});
    }

    res.status(201).json({ success: true, consultation: parseConsultation(result.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create consultation' });
  }
});

// ===== MEDICAL RECORDS =====

function parseMedicalRecord(row) {
  if (!row) return null;
  return {
    ...row,
    patientId: row.patient_id,
    details: typeof row.details === 'string' ? JSON.parse(row.details) : (row.details || {}),
  };
}

// GET /api/medical-records
router.get('/medical-records', async (req, res) => {
  try {
    const pool = await getDb();
    const { patientId, type } = req.query;
    let query = 'SELECT * FROM medical_records';
    const conditions = [];
    const params = [];

    if (patientId) { params.push(patientId); conditions.push(`patient_id = $${params.length}`); }
    if (type) { params.push(type); conditions.push(`type = $${params.length}`); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows.map(parseMedicalRecord));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

export default router;
