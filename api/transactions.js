const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Pool PostgreSQL (gunakan .env untuk credential di production)
const pool = new Pool({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.jjieqhvfadoqkahpqdvl',
  password: 'pekerjakeras123',
  ssl: true
});

// Update transaksi
router.put('/update', async (req, res) => {
  const {
    id,
    user_id,
    type,
    amount,
    category_id,
    category,
    description,
    date
  } = req.body;

  // Validasi input
  if (
    !id || !user_id || !type || !category_id || !category || !date || amount === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: 'Data POST tidak lengkap',
      debug: {
        received_data: req.body
      }
    });
  }

  try {
    const result = await pool.query(
      `UPDATE transactions
       SET type = $1, amount = $2, category_id = $3, category = $4, description = $5, date = $6, updated_at = NOW()
       WHERE id = $7 AND user_id = $8`,
      [
        type,
        parseFloat(amount),
        category_id,
        category,
        description,
        date,
        id,        // UUID string
        user_id    // UUID string
      ]
    );

    if (result.rowCount > 0) {
      res.json({ success: true, message: 'Transaksi berhasil diupdate' });
    } else {
      res.json({ success: false, message: 'Tidak ada data yang diupdate atau transaksi tidak ditemukan' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
});

module.exports = router;