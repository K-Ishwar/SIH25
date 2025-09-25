import { Router } from 'express';
import pool from '../db.js';
import { auth, staffOrAdminAuth } from '../middleware/auth.js';
import { parser } from '../cloudinary.js';

const router = Router();

// @route   POST api/reports
// @desc    Create a new report
// @access  Private
router.post('/', [auth, parser.single('photo')], async (req, res) => {
  const { title, description, latitude, longitude } = req.body;
  const userId = req.user.id;

  if (!title || !description || !latitude || !longitude) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // The photo URL will be available in req.file.path after being uploaded by multer-storage-cloudinary
  const photoUrl = req.file ? req.file.path : null;
  const location = `POINT(${longitude} ${latitude})`;

  try {
    const newReport = await pool.query(
      'INSERT INTO reports (user_id, title, description, location, photo_url) VALUES ($1, $2, $3, ST_GeomFromText($4, 4326), $5) RETURNING *',
      [userId, title, description, location, photoUrl]
    );

    res.status(201).json(newReport.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating report' });
  }
});

// @route   GET api/reports
// @desc    Get all reports
// @access  Public
router.get('/', async (req, res) => {
  try {
    const reports = await pool.query('SELECT id, title, description, status, priority, ST_AsText(location) as location, photo_url, created_at FROM reports ORDER BY created_at DESC');
    res.json(reports.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while getting reports' });
  }
});

// @route   GET api/reports/my-reports
// @desc    Get reports for the logged-in user
// @access  Private
router.get('/my-reports', auth, async (req, res) => {
    try {
      const reports = await pool.query(
        'SELECT id, title, status, created_at FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
      res.json(reports.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while getting user reports' });
    }
  });

// @route   GET api/reports/:id
// @desc    Get a single report by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const report = await pool.query('SELECT id, title, description, status, priority, ST_AsText(location) as location, photo_url, user_id, created_at FROM reports WHERE id = $1', [req.params.id]);

    if (report.rows.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while getting report' });
  }
});

// @route   PUT api/reports/:id
// @desc    Update a report's status or assignment
// @access  Staff/Admin
router.put('/:id', [auth, staffOrAdminAuth], async (req, res) => {
    const { id } = req.params;
    const { status, assigned_department_id } = req.body;
    const adminUserId = req.user.id;

    if (!status && !assigned_department_id) {
      return res.status(400).json({ message: 'No update data provided.' });
    }

    try {
      // Build the update query dynamically
      const fields = [];
      const values = [];
      let query_parts = [];
      let value_index = 1;

      if (status) {
        query_parts.push(`status = $${value_index++}`);
        values.push(status);
      }
      if (assigned_department_id) {
        query_parts.push(`assigned_department_id = $${value_index++}`);
        values.push(assigned_department_id);
      }

      values.push(id);

      const updateQuery = `UPDATE reports SET ${query_parts.join(', ')}, updated_at = NOW() WHERE id = $${value_index} RETURNING *`;

      const updatedReport = await pool.query(updateQuery, values);

      if (updatedReport.rows.length === 0) {
        return res.status(404).json({ message: 'Report not found' });
      }

      // Log the update in the report_updates table
      if (status) {
        await pool.query(
          'INSERT INTO report_updates (report_id, user_id, status_change) VALUES ($1, $2, $3)',
          [id, adminUserId, status]
        );
      }

      res.json(updatedReport.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while updating report' });
    }
  });

export default router;