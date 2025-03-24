import bcrypt from 'bcrypt';
import pool from '../db/dbConfig';

async function createAdminUser() {
  try {
    const email = 'kessal.rayhan25@gmail.com';
    const password = 'fizz123adm*';
    const name = 'Rayhan Kessal';
    const role = 'admin';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if admin already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, role]
    );

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    pool.end();
  }
}

createAdminUser(); 