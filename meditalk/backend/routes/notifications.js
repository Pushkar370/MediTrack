import { Router } from 'express';
import { query } from '../database/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let sql = 'SELECT * FROM notifications';
    const params = [];
    if (userId) { sql += ' WHERE user_id = $1'; params.push(userId); }
    sql += ' ORDER BY date DESC';
    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({ ...r, read: !!r.read })));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch notifications' }); }
});

router.patch('/read-all', async (req, res) => {
  try {
    const { userId } = req.body;
    let sql = 'UPDATE notifications SET read = true';
    const params = [];
    if (userId) { sql += ' WHERE user_id = $1'; params.push(userId); }
    await query(sql, params);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update notifications' }); }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const { rowCount } = await query('UPDATE notifications SET read = true WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update notification' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to delete notification' }); }
});

export default router;
