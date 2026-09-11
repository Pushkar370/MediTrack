import { Router } from 'express';
import { query } from '../database/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All notification routes require authentication.
// Users can only manage their own notifications (userId comes from JWT, not request body).

// GET /api/notifications — returns notifications for the authenticated user only
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { rows } = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(rows.map(r => ({ ...r, read: !!r.read })));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch notifications' }); }
});

// PATCH /api/notifications/read-all — marks all of the authenticated user's notifications as read
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    await query('UPDATE notifications SET read = true WHERE user_id = $1', [userId]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update notifications' }); }
});

// PATCH /api/notifications/:id/read — marks a single notification as read (owns check)
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { rowCount } = await query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update notification' }); }
});

// DELETE /api/notifications/:id — deletes the notification (owns check)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { rowCount } = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to delete notification' }); }
});

export default router;
