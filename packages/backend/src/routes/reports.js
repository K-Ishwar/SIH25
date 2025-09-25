import { Router } from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
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

export default router;