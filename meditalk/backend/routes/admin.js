import { Router } from 'express';
import { getDb } from '../database/db.js';

const router = Router();

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const pool = await getDb();
    const today = new Date().toISOString().slice(0, 10);

    const totalPatientsRes = await pool.query('SELECT COUNT(*) as count FROM patients');
    const totalDoctorsRes = await pool.query('SELECT COUNT(*) as count FROM doctors');
    const todayAppointmentsRes = await pool.query('SELECT COUNT(*) as count FROM appointments WHERE date = $1', [today]);
    const completedConsultationsRes = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'");
    const cancelledAppointmentsRes = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'");
    const pendingAppointmentsRes = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE status IN ('upcoming', 'confirmed')");

    res.json({
      totalPatients: parseInt(totalPatientsRes.rows[0].count, 10),
      totalDoctors: parseInt(totalDoctorsRes.rows[0].count, 10),
      todayAppointments: parseInt(todayAppointmentsRes.rows[0].count, 10),
      completedConsultations: parseInt(completedConsultationsRes.rows[0].count, 10),
      cancelledAppointments: parseInt(cancelledAppointmentsRes.rows[0].count, 10),
      pendingAppointments: parseInt(pendingAppointmentsRes.rows[0].count, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const pool = await getDb();

    // Appointment trends by day of week (Mon-Sun)
    const dayRows = await pool.query(`
      SELECT EXTRACT(DOW FROM date) as dow, COUNT(*) as count
      FROM appointments GROUP BY dow
    `);
    const dayMap = Object.fromEntries(dayRows.rows.map((r) => [parseInt(r.dow, 10), parseInt(r.count, 10)]));
    // Build Mon-Sun order (1-6, 0)
    const appointmentTrends = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [1, 2, 3, 4, 5, 6, 0].map((d) => dayMap[d] || 0),
    };

    // Patient registrations by month (last 8 months)
    const monthLabels = [];
    const monthData = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const ym = d.toISOString().slice(0, 7); // YYYY-MM
      const label = d.toLocaleString('default', { month: 'short' });
      monthLabels.push(label);
      const countRes = await pool.query("SELECT COUNT(*) as count FROM patients WHERE TO_CHAR(registered_at, 'YYYY-MM') = $1", [ym]);
      monthData.push(parseInt(countRes.rows[0].count, 10));
    }
    const patientRegistrations = { labels: monthLabels, data: monthData };

    // Consultation trends by month (last 6)
    const consultLabels = [];
    const consultData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const ym = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('default', { month: 'short' });
      consultLabels.push(label);
      const countRes = await pool.query("SELECT COUNT(*) as count FROM consultations WHERE TO_CHAR(date, 'YYYY-MM') = $1", [ym]);
      consultData.push(parseInt(countRes.rows[0].count, 10));
    }
    const consultationTrends = { labels: consultLabels, data: consultData };

    // Appointment status distribution
    const statusRows = await pool.query('SELECT status, COUNT(*) as count FROM appointments GROUP BY status');
    const statusMap = Object.fromEntries(statusRows.rows.map((r) => [r.status, parseInt(r.count, 10)]));
    const appointmentStatus = {
      labels: ['Completed', 'Upcoming', 'Confirmed', 'Cancelled'],
      data: [
        statusMap['completed'] || 0,
        statusMap['upcoming'] || 0,
        statusMap['confirmed'] || 0,
        statusMap['cancelled'] || 0,
      ],
    };

    // Patient demographics by age group
    const ageRows = await pool.query("SELECT dob FROM patients WHERE dob IS NOT NULL");
    const ageBuckets = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
    const currentYear = new Date().getFullYear();
    ageRows.rows.forEach(({ dob }) => {
      const age = currentYear - new Date(dob).getFullYear();
      if (age <= 18) ageBuckets['0-18']++;
      else if (age <= 35) ageBuckets['19-35']++;
      else if (age <= 50) ageBuckets['36-50']++;
      else if (age <= 65) ageBuckets['51-65']++;
      else ageBuckets['65+']++;
    });
    const patientDemographics = {
      labels: Object.keys(ageBuckets),
      data: Object.values(ageBuckets),
    };

    // Doctor workload
    const workloadRows = await pool.query(`
      SELECT d.name, COUNT(a.id) as count
      FROM doctors d LEFT JOIN appointments a ON d.id = a.doctor_id
      GROUP BY d.id, d.name ORDER BY count DESC LIMIT 5
    `);
    const doctorWorkload = {
      labels: workloadRows.rows.map((r) => r.name.replace('Dr. ', 'Dr. ').split(' ').slice(0, 2).join(' ')),
      data: workloadRows.rows.map((r) => parseInt(r.count, 10)),
    };

    // Specialty appointments
    const specialtyRows = await pool.query(`
      SELECT specialty, COUNT(*) as count FROM appointments WHERE specialty IS NOT NULL
      GROUP BY specialty ORDER BY count DESC
    `);
    const specialtyAppointments = {
      labels: specialtyRows.rows.map((r) => r.specialty),
      data: specialtyRows.rows.map((r) => parseInt(r.count, 10)),
    };

    res.json({
      appointmentTrends,
      patientRegistrations,
      consultationTrends,
      appointmentStatus,
      patientDemographics,
      doctorWorkload,
      specialtyAppointments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admin analytics' });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const pool = await getDb();
    const { role, status, search } = req.query;
    let query = 'SELECT * FROM audit_logs';
    const conditions = [];
    const params = [];

    if (role) { params.push(role); conditions.push(`role = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      const p1 = params.length;
      params.push(`%${search}%`);
      const p2 = params.length;
      conditions.push(`(user_name ILIKE $${p1} OR action ILIKE $${p2})`);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY timestamp DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
