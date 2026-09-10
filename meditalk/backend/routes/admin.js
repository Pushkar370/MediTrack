import { Router } from 'express';
import { query } from '../database/db.js';

const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [tp, td, ta, cc, ca, pa] = await Promise.all([
      query('SELECT COUNT(*) as count FROM patients'),
      query('SELECT COUNT(*) as count FROM doctors'),
      query('SELECT COUNT(*) as count FROM appointments WHERE date = $1', [today]),
      query("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'"),
      query("SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'"),
      query("SELECT COUNT(*) as count FROM appointments WHERE status IN ('upcoming', 'confirmed')"),
    ]);
    res.json({
      totalPatients: parseInt(tp.rows[0].count),
      totalDoctors: parseInt(td.rows[0].count),
      todayAppointments: parseInt(ta.rows[0].count),
      completedConsultations: parseInt(cc.rows[0].count),
      cancelledAppointments: parseInt(ca.rows[0].count),
      pendingAppointments: parseInt(pa.rows[0].count),
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch admin stats' }); }
});

router.get('/analytics', async (req, res) => {
  try {
    const { rows: dayRows } = await query(`
      SELECT EXTRACT(DOW FROM date::date)::int as dow, COUNT(*) as count
      FROM appointments GROUP BY dow
    `);
    const dayMap = Object.fromEntries(dayRows.map(r => [r.dow, parseInt(r.count)]));
    const appointmentTrends = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [1,2,3,4,5,6,0].map(d => dayMap[d] || 0),
    };

    const monthLabels = []; const monthData = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const ym = d.toISOString().slice(0, 7);
      monthLabels.push(d.toLocaleString('default', { month: 'short' }));
      const { rows } = await query("SELECT COUNT(*) as count FROM patients WHERE TO_CHAR(registered_at, 'YYYY-MM') = $1", [ym]);
      monthData.push(parseInt(rows[0].count));
    }
    const patientRegistrations = { labels: monthLabels, data: monthData };

    const consultLabels = []; const consultData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const ym = d.toISOString().slice(0, 7);
      consultLabels.push(d.toLocaleString('default', { month: 'short' }));
      const { rows } = await query("SELECT COUNT(*) as count FROM consultations WHERE TO_CHAR(date, 'YYYY-MM') = $1", [ym]);
      consultData.push(parseInt(rows[0].count));
    }
    const consultationTrends = { labels: consultLabels, data: consultData };

    const { rows: statusRows } = await query('SELECT status, COUNT(*) as count FROM appointments GROUP BY status');
    const statusMap = Object.fromEntries(statusRows.map(r => [r.status, parseInt(r.count)]));
    const appointmentStatus = {
      labels: ['Completed', 'Upcoming', 'Confirmed', 'Cancelled'],
      data: [statusMap['completed']||0, statusMap['upcoming']||0, statusMap['confirmed']||0, statusMap['cancelled']||0],
    };

    const { rows: ageRows } = await query("SELECT dob FROM patients WHERE dob IS NOT NULL AND dob != ''");
    const ageBuckets = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
    const cy = new Date().getFullYear();
    ageRows.forEach(({ dob }) => {
      const age = cy - new Date(dob).getFullYear();
      if (age <= 18) ageBuckets['0-18']++;
      else if (age <= 35) ageBuckets['19-35']++;
      else if (age <= 50) ageBuckets['36-50']++;
      else if (age <= 65) ageBuckets['51-65']++;
      else ageBuckets['65+']++;
    });
    const patientDemographics = { labels: Object.keys(ageBuckets), data: Object.values(ageBuckets) };

    const { rows: workloadRows } = await query(`
      SELECT d.name, COUNT(a.id) as count FROM doctors d
      LEFT JOIN appointments a ON d.id = a.doctor_id
      GROUP BY d.id, d.name ORDER BY count DESC LIMIT 5
    `);
    const doctorWorkload = {
      labels: workloadRows.map(r => r.name.split(' ').slice(0, 2).join(' ')),
      data: workloadRows.map(r => parseInt(r.count)),
    };

    const { rows: specialtyRows } = await query(`
      SELECT specialty, COUNT(*) as count FROM appointments WHERE specialty IS NOT NULL
      GROUP BY specialty ORDER BY count DESC
    `);
    const specialtyAppointments = {
      labels: specialtyRows.map(r => r.specialty),
      data: specialtyRows.map(r => parseInt(r.count)),
    };

    res.json({ appointmentTrends, patientRegistrations, consultationTrends, appointmentStatus, patientDemographics, doctorWorkload, specialtyAppointments });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch analytics' }); }
});

router.get('/audit-logs', async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let sql = 'SELECT * FROM audit_logs';
    const conditions = []; const params = []; let idx = 1;
    if (role) { conditions.push('role = $' + idx++); params.push(role); }
    if (status) { conditions.push('status = $' + idx++); params.push(status); }
    if (search) {
      conditions.push('(user_name ILIKE $' + idx + ' OR action ILIKE $' + (idx+1) + ')');
      params.push('%'+search+'%', '%'+search+'%'); idx += 2;
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY timestamp DESC';
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch audit logs' }); }
});

export default router;
