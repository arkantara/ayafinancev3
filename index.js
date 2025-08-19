const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Environment variable validation untuk production
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingEnvVars.join(', '));
  console.warn('⚠️  App will use fallback configuration for development');
}

// Environment variable injection middleware for specific HTML files FIRST
const htmlFiles = ['dashboard.html', 'budget.html', 'login.html', 'register.html', 'transactions.html', 'profil.html'];

htmlFiles.forEach(filename => {
  app.get('/' + filename, (req, res) => {
    console.log(`[DEBUG] Handling request for ${filename}`);
    console.log(`[DEBUG] Environment variables: URL=${!!process.env.SUPABASE_URL}, KEY=${!!process.env.SUPABASE_KEY}`);
    
    const filePath = path.join(__dirname, 'public', filename);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    let html = fs.readFileSync(filePath, 'utf8');
    
    // Inject environment variables
    const envScript = `
    <script>
      window.SUPABASE_URL = '${process.env.SUPABASE_URL || ''}';
      window.SUPABASE_KEY = '${process.env.SUPABASE_KEY || ''}';
      console.log('[Config] Environment variables loaded');
    </script>
  `;
    
    console.log(`[DEBUG] Injecting environment script for ${filename}`);
    
    // Insert before closing head tag
    html = html.replace('</head>', envScript + '</head>');
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });
});

// Serve static files from public directory AFTER HTML injection routes
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.jjieqhvfadoqkahpqdvl',
  password: 'pekerjakeras123',
  ssl: true
});

// Login endpoint
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
    res.json({ success: true, message: 'Login berhasil', user });
  } else {
    res.json({ success: false, message: 'Username/Email atau password salah' });
  }
});

// Budget API endpoints - langsung di index.js untuk Vercel compatibility
app.get('/api/budgets/current', async (req, res) => {
  try {
    console.log('[Budget API] GET /api/budgets/current called');
    const userId = req.query.user_id || 'demo-user';
    
    // Return sample budget data untuk testing
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const sampleBudgets = [
      { 
        id: '1', 
        user_id: userId,
        category: 'Makanan & Minuman', 
        amount: 500000, 
        actual_amount: 250000,
        percentage_used: 50,
        remaining: 250000,
        month: currentMonth,
        year: currentYear,
        status: 'safe'
      },
      { 
        id: '2', 
        user_id: userId,
        category: 'Transportasi', 
        amount: 300000, 
        actual_amount: 240000,
        percentage_used: 80,
        remaining: 60000,
        month: currentMonth,
        year: currentYear,
        status: 'warning'
      },
      { 
        id: '3', 
        user_id: userId,
        category: 'Hiburan', 
        amount: 200000, 
        actual_amount: 180000,
        percentage_used: 90,
        remaining: 20000,
        month: currentMonth,
        year: currentYear,
        status: 'danger'
      }
    ];

    res.json({
      success: true,
      data: sampleBudgets,
      month: currentMonth,
      year: currentYear,
      summary: {
        total_budget: sampleBudgets.reduce((sum, b) => sum + b.amount, 0),
        total_spent: sampleBudgets.reduce((sum, b) => sum + b.actual_amount, 0),
        categories_count: sampleBudgets.length
      }
    });
  } catch (error) {
    console.error('[Budget API] Error in /current:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/budgets/setup', async (req, res) => {
  try {
    console.log('[Budget API] POST /api/budgets/setup called');
    const { user_id, budgets } = req.body;
    
    if (!budgets || !Array.isArray(budgets)) {
      return res.status(400).json({ error: 'Invalid budgets data' });
    }

    // Simulate saving budgets
    const results = budgets.map((budget, index) => ({
      id: `new-${index + 1}`,
      user_id: user_id || 'demo-user',
      category: budget.category,
      amount: parseFloat(budget.amount) || 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      created_at: new Date().toISOString(),
      action: 'created'
    }));

    res.json({
      success: true,
      data: results,
      message: `Successfully saved ${results.length} budget entries`
    });
  } catch (error) {
    console.error('[Budget API] Error in /setup:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/api/budgets/categories', (req, res) => {
  try {
    console.log('[Budget API] GET /api/budgets/categories called');
    res.json({
      success: true,
      data: [
        'Makanan & Minuman',
        'Transportasi', 
        'Hiburan',
        'Belanja',
        'Tagihan',
        'Kesehatan',
        'Pendidikan',
        'Lainnya'
      ]
    });
  } catch (error) {
    console.error('[Budget API] Error in /categories:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Simple budget endpoints directly in index.js untuk debugging
app.get('/api/budgets/current', async (req, res) => {
  try {
    console.log('[Budget] /current endpoint called');
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Return sample budget data untuk testing
    res.json({
      success: true,
      data: [
        { 
          id: '1', 
          category: 'Makanan & Minuman', 
          amount: 500000, 
          actual_amount: 250000,
          percentage_used: 50,
          remaining: 250000,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        },
        { 
          id: '2', 
          category: 'Transportasi', 
          amount: 300000, 
          actual_amount: 150000,
          percentage_used: 50,
          remaining: 150000,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        }
      ],
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      summary: {
        total_budget: 800000,
        total_spent: 400000,
        categories_count: 2
      }
    });
  } catch (error) {
    console.error('[Budget] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/budgets/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      'Makanan & Minuman',
      'Transportasi', 
      'Hiburan',
      'Belanja',
      'Tagihan',
      'Kesehatan',
      'Pendidikan',
      'Lainnya'
    ]
  });
});

// Import dan gunakan route transaksi
const transactionRoutes = require('./api/transactions');
app.use('/api/transactions', transactionRoutes);

// Import dan gunakan route auth
const authRoutes = require('./api/auth');
app.use('/api/auth', authRoutes);

// Import dan gunakan route budgets
try {
  const budgetRoutes = require('./api/budgets');
  app.use('/api/budgets', budgetRoutes);
  console.log('✅ Budget routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading budget routes:', error.message);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test budget endpoint - VERY SIMPLE
app.get('/test-budget', (req, res) => {
  res.json({ message: 'Budget endpoint works!', timestamp: new Date().toISOString() });
});

// Redirect root to dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard.html');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));