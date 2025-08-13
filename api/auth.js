const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Pool PostgreSQL (gunakan .env di production)
const pool = new Pool({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.jjieqhvfadoqkahpqdvl',
  password: 'pekerjakeras123',
  ssl: true
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, username, password } = req.body;
  const loginField = email || username;
  if (!loginField || !password) {
    return res.json({ success: false, message: 'Username/Email dan password harus diisi' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE (email = $1 OR username = $1) AND is_active = TRUE',
      [loginField]
    );
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
      res.json({
        success: true,
        message: 'Login berhasil',
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          username: user.username,
          role: user.role,
          photo_url: user.photo_url,
          is_active: user.is_active
        }
      });
    } else {
      res.json({ success: false, message: 'Username/Email atau password salah' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, username, password } = req.body;
  if (!name || !email || !username || !password) {
    return res.json({ success: false, message: 'Semua field harus diisi' });
  }

  try {
    const exists = await pool.query(
      'SELECT COUNT(*) FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (parseInt(exists.rows[0].count) > 0) {
      return res.json({ success: false, message: 'Email/Username sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (full_name, email, username, password, is_active, create_at) VALUES ($1, $2, $3, $4, TRUE, NOW())',
      [name, email, username, hashedPassword]
    );
    if (result.rowCount > 0) {
      res.status(201).json({ success: true, message: 'Registrasi berhasil' });
    } else {
      res.status(400).json({ success: false, message: 'Gagal mendaftarkan user' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;