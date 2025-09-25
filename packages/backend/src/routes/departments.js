import { Router } from 'express';
import pool from '../db.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = Router();

// @route   GET api/departments
// @desc    Get all departments
// @access  Private (for authenticated users)
router.get('/', auth, async (req, res) => {
  try {
    const departments = await pool.query('SELECT * FROM departments ORDER BY name');
    res.json(departments.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while getting departments' });
  }
});

// @route   POST api/departments
// @desc    Create a new department
// @access  Admin
router.post('/', [auth, adminAuth], async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Department name is required' });
  }

  try {
    // Check if department already exists
    const departmentExists = await pool.query('SELECT * FROM departments WHERE name = $1', [name]);
    if (departmentExists.rows.length > 0) {
      return res.status(409).json({ message: 'Department with this name already exists' });
    }

    const newDepartment = await pool.query(
      'INSERT INTO departments (name) VALUES ($1) RETURNING *',
      [name]
    );

    res.status(201).json(newDepartment.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating department' });
  }
});

export default router;