const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// all routes below require login
router.use(authMiddleware);

// GET all applications for logged-in user
router.get('/', async (req, res) => {
  try {
    const [applications] = await db.query(
      'SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// POST add new application
router.post('/', async (req, res) => {
  try {
    const { company_name, role, status, applied_date, notes } = req.body;

    if (!company_name || !role) {
      return res.status(400).json({ error: 'Company name and role are required' });
    }

    const [result] = await db.query(
      'INSERT INTO applications (user_id, company_name, role, status, applied_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.userId, company_name, role, status || 'applied', applied_date || null, notes || null]
    );

    res.status(201).json({ message: 'Application added', applicationId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add application' });
  }
});

// PUT update an application
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, role, status, applied_date, notes } = req.body;

    // make sure this application belongs to the logged-in user
    const [existing] = await db.query(
      'SELECT * FROM applications WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await db.query(
      'UPDATE applications SET company_name = ?, role = ?, status = ?, applied_date = ?, notes = ? WHERE id = ?',
      [company_name, role, status, applied_date, notes, id]
    );

    res.json({ message: 'Application updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// DELETE an application
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      'SELECT * FROM applications WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await db.query('DELETE FROM applications WHERE id = ?', [id]);

    res.json({ message: 'Application deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;