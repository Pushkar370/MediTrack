import { Router } from 'express';
import { getDb } from '../database/db.js';

const router = Router();

function parseNotif(row) {
  return { ...row, read: !!row.is_read };
}

// GET /api/notifications?userId=
router.get('/', async (req, res) => {
  try {
    const pool = await getDb();
    const { userId } = req.query;
    let query = 'SELECT * FROM notifications';
    const params = [];

    if (userId) {
      params.push(userId);
      query += ` WHERE user_id = $${params.length}`;
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows.map(parseNotif));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res) => {
  try {
    const pool = await getDb();
    const { userId } = req.body;
    let query = 'UPDATE notifications SET is_read = true';
    const params = [];
    if (userId) {
      params.push(userId);
      query += ` WHERE user_id = $${params.length}`;
    }
    await pool.query(query, params);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const pool = await getDb();
    const result = await pool.query('UPDATE notifications SET is_read = true WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getDb();
    const result = await pool.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
