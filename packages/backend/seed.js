import bcrypt from 'bcryptjs';
import pool from './src/db.js';

const users = [
  {
    full_name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
  },
  {
    full_name: 'Staff User',
    email: 'staff@test.com',
    password: 'password123',
    role: 'staff',
  },
  {
    full_name: 'Citizen User',
    email: 'citizen@test.com',
    password: 'password123',
    role: 'citizen',
  },
];

const seedUsers = async () => {
  try {
    for (const user of users) {
      // Check if user already exists
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);

      if (userExists.rows.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(user.password, salt);

        await pool.query(
          'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
          [user.full_name, user.email, password_hash, user.role]
        );
        console.log(`User ${user.email} created.`);
      } else {
        console.log(`User ${user.email} already exists. Skipping.`);
      }
    }
    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    pool.end(); // Close the connection pool
  }
};

seedUsers();