const express = require('express');
<<<<<<< HEAD
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment variables dengan fallback untuk development
const supabaseUrl = process.env.SUPABASE_URL || 'https://jjieqhvfadoqkahpqdvl.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjExODEsImV4cCI6MjA2ODEzNzE4MX0.8rwAFQew3HbzdBgoseq_DX-R6YwJB2Fk5OMgm4KrmBM';

// Cek environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.log('⚠️  Missing environment variables: SUPABASE_URL, SUPABASE_KEY');
  console.log('⚠️  App will use fallback configuration for development');
}

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Inject environment variables ke static files
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    const filePath = path.join(__dirname, 'public', req.path);
    const fs = require('fs');
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Inject environment variables
      const envScript = `
        <script>
          window.SUPABASE_URL = '${supabaseUrl}';
          window.SUPABASE_KEY = '${supabaseKey}';
        </script>
      `;
      
      content = content.replace('</head>', envScript + '</head>');
      res.setHeader('Content-Type', 'text/html');
      return res.send(content);
    }
  }
  next();
});

// Serve static files
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username });
  
  // Simplified validation untuk testing
  if (username && password) {
    const user = { id: 1, username, email: username };
=======
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.jjieqhvfadoqkahpqdvl',
  password: 'pekerjakeras123',
  ssl: true
});

// Contoh endpoint login
app.post('/api/auth/login', async (req, res) => {
  const { username, email, password } = req.body;
  const loginField = username || email;
  if (!loginField || !password) return res.json({ success: false, message: 'Username/Email dan password harus diisi' });

  const result = await pool.query(
    'SELECT * FROM users WHERE (email = $1 OR username = $1) AND is_active = TRUE',
    [loginField]
  );
  const user = result.rows[0];
  if (user && await bcrypt.compare(password, user.password)) {
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
>>>>>>> e0c4c491ffb3c5d82991964fffcacd397cd65b8f
    res.json({ success: true, message: 'Login berhasil', user });
  } else {
    res.json({ success: false, message: 'Username/Email atau password salah' });
  }
});

<<<<<<< HEAD
=======
const express = require('express');
app = express();
app.use(express.json());

>>>>>>> e0c4c491ffb3c5d82991964fffcacd397cd65b8f
// Import dan gunakan route transaksi
const transactionRoutes = require('./api/transactions');
app.use('/api/transactions', transactionRoutes);

<<<<<<< HEAD
// Import dan gunakan route categories
const categoryRoutes = require('./api/categories');
app.use('/api/categories', categoryRoutes);

// Import dan gunakan route auth
const authRoutes = require('./api/auth');
app.use('/api/auth', authRoutes);

// Categories API endpoint - untuk Budget System
app.get('/api/categories', async (req, res) => {
  try {
    console.log('[Categories API] GET /api/categories called');
    
    // Categories untuk Budget System
    const categories = [
      { id: '1', name: 'Makanan & Minuman', icon: 'fas fa-utensils' },
      { id: '2', name: 'Transportasi', icon: 'fas fa-car' },
      { id: '3', name: 'Hiburan', icon: 'fas fa-gamepad' },
      { id: '4', name: 'Belanja', icon: 'fas fa-shopping-bag' },
      { id: '5', name: 'Tagihan', icon: 'fas fa-receipt' },
      { id: '6', name: 'Kesehatan', icon: 'fas fa-heartbeat' },
      { id: '7', name: 'Pendidikan', icon: 'fas fa-graduation-cap' },
      { id: '8', name: 'Lainnya', icon: 'fas fa-ellipsis-h' }
    ];

    console.log('[Categories API] Categories loaded:', categories.length);
    res.json(categories);
    
  } catch (error) {
    console.error('[Categories API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import dan gunakan route budgets

// Directly define /api/budgets endpoints for Vercel compatibility
app.get('/api/budgets/categories', async (req, res) => {
  try {
    console.log('[Budget API] GET /api/budgets/categories called');
    const categories = [
      { id: '1', name: 'Makanan & Minuman', icon: 'fas fa-utensils' },
      { id: '2', name: 'Transportasi', icon: 'fas fa-car' },
      { id: '3', name: 'Hiburan', icon: 'fas fa-gamepad' },
      { id: '4', name: 'Belanja', icon: 'fas fa-shopping-bag' },
      { id: '5', name: 'Tagihan', icon: 'fas fa-receipt' },
      { id: '6', name: 'Kesehatan', icon: 'fas fa-heartbeat' },
      { id: '7', name: 'Pendidikan', icon: 'fas fa-graduation-cap' },
      { id: '8', name: 'Lainnya', icon: 'fas fa-ellipsis-h' }
    ];
    res.json(categories);
  } catch (error) {
    console.error('[Budget API] Categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/budgets/setup', async (req, res) => {
  try {
    console.log('[Budget API] POST /api/budgets/setup called with:', req.body);
    const { budgets } = req.body;
    if (!budgets || !Array.isArray(budgets)) {
      return res.status(400).json({ error: 'Invalid budget data' });
    }
    // Simulate saving to database
    const results = budgets.map((budget, index) => ({
      id: `budget_${Date.now()}_${index}`,
      category_id: budget.category_id,
      amount: budget.amount,
      created_at: new Date().toISOString(),
      status: 'active'
    }));
    res.json({
      success: true,
      data: results,
      message: `Successfully saved ${results.length} budget entries`
    });
  } catch (error) {
    console.error('[Budget API] Setup budget error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Notes API endpoints - untuk Vercel compatibility
app.get('/api/notes', async (req, res) => {
  try {
    console.log('[Notes API] GET /api/notes called');
    // Fallback data untuk testing
    const sampleNotes = [
      {
        id: '1',
        title: 'Budget Planning Januari 2025',
        category: 'budget',
        type: 'table',
        content: '<table class="w-full"><thead><tr><th class="table-cell table-header">Kategori</th><th class="table-cell table-header">Budget</th><th class="table-cell table-header">Realisasi</th></tr></thead><tbody><tr><td class="table-cell">Makanan</td><td class="table-cell">500000</td><td class="table-cell">250000</td></tr></tbody></table>',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2', 
        title: 'Shopping List Minggu Ini',
        category: 'shopping',
        type: 'table',
        content: '<table class="w-full"><thead><tr><th class="table-cell table-header">Item</th><th class="table-cell table-header">Jumlah</th><th class="table-cell table-header">Status</th></tr></thead><tbody><tr><td class="table-cell">Beras 5kg</td><td class="table-cell">1</td><td class="table-cell">Belum Beli</td></tr></tbody></table>',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    res.json(sampleNotes);
  } catch (error) {
    console.error('[Notes API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    console.log('[Notes API] POST /api/notes called with:', req.body);
    const { title, category, type, content } = req.body;
    if (!title || !category || !type || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newNote = {
      id: Date.now().toString(),
      title,
      category,
      type,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    res.status(201).json(newNote);
  } catch (error) {
    console.error('[Notes API] Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[Notes API] PUT /api/notes/:id called for ID:', id);
    const { title, category, type, content } = req.body;
    if (!title || !category || !type || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const updatedNote = {
      id,
      title,
      category,
      type,
      content,
      updated_at: new Date().toISOString()
    };
    res.json(updatedNote);
  } catch (error) {
    console.error('[Notes API] Update note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[Notes API] DELETE /api/notes/:id called for ID:', id);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('[Notes API] Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test budget endpoint - VERY SIMPLE
app.get('/test-budget', (req, res) => {
  res.json({ message: 'Budget endpoint works!', timestamp: new Date().toISOString() });
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
=======
app.listen(3000, () => console.log('Server running on port 3000'));

const express = require('express');
app = express();
app.use(express.json());

const authRoutes = require('./api/auth');
app.use('/api/auth', authRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));

// Endpoint lain: register, transaksi, dsb...

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
>>>>>>> e0c4c491ffb3c5d82991964fffcacd397cd65b8f
