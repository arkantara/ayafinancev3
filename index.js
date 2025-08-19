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


app.get('/api/budgets/current', async (req, res) => {
  try {
    console.log('[Budget API] GET /api/budgets/current called');
    
    // Get user dari Authorization header (Supabase JWT)
    const authHeader = req.headers.authorization;
    let userId = 'demo-user'; // fallback
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // In real app, decode JWT untuk get user ID
      userId = 'demo-user'; // Simplified untuk testing
    }
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const sampleBudgets = [
      { 
        id: '1', 
        category_id: '1',
        category_name: 'Makanan & Minuman',
        category_icon: 'fas fa-utensils',
        budget_amount: 500000, 
        spent_amount: 250000,
        remaining_amount: 250000,
        percentage_used: 50,
        month: currentMonth,
        year: currentYear,
        status: 'safe'
      },
      { 
        id: '2', 
        category_id: '2',
        category_name: 'Transportasi',
        category_icon: 'fas fa-car',
        budget_amount: 300000, 
        spent_amount: 240000,
        remaining_amount: 60000,
        percentage_used: 80,
        month: currentMonth,
        year: currentYear,
        status: 'warning'
      },
      { 
        id: '3', 
        category_id: '3',
        category_name: 'Hiburan',
        category_icon: 'fas fa-gamepad',
        budget_amount: 200000, 
        spent_amount: 180000,
        remaining_amount: 20000,
        percentage_used: 90,
        month: currentMonth,
        year: currentYear,
        status: 'danger'
      }
    ];

    const totalBudget = sampleBudgets.reduce((sum, b) => sum + b.budget_amount, 0);
    const totalSpent = sampleBudgets.reduce((sum, b) => sum + b.spent_amount, 0);
    const remainingBudget = totalBudget - totalSpent;
    const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Calculate days left in month
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysLeft = Math.max(0, lastDayOfMonth.getDate() - today.getDate());

    res.json({
      budgets: sampleBudgets,
      month: currentMonth,
      year: currentYear,
      summary: {
        totalBudget,
        totalSpent,
        remainingBudget,
        percentageUsed,
        daysLeft
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
    const { budgets, month, year } = req.body;
    
    if (!budgets || !Array.isArray(budgets)) {
      return res.status(400).json({ error: 'Invalid budgets data' });
    }

    // Simulate saving budgets
    const results = budgets.map((budget, index) => ({
      id: `new-${index + 1}`,
      category_id: budget.category_id,
      budget_amount: parseFloat(budget.budget_amount) || 0,
      alert_threshold: budget.alert_threshold || 80,
      month: month || new Date().getMonth() + 1,
      year: year || new Date().getFullYear(),
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

app.get('/api/budgets/categories', async (req, res) => {
  try {
    console.log('[Budget API] GET /api/budgets/categories called');
    
    // Ambil categories dari database Supabase
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, icon, color')
      .eq('type', 'expense')
      .order('name');

    if (error) {
      console.error('[Budget API] Error fetching categories from database:', error);
      // Fallback categories jika database error
      return res.json([
        { id: '1', name: 'Makanan & Minuman', icon: 'fas fa-utensils' },
        { id: '2', name: 'Transportasi', icon: 'fas fa-car' },
        { id: '3', name: 'Hiburan', icon: 'fas fa-gamepad' },
        { id: '4', name: 'Belanja', icon: 'fas fa-shopping-bag' },
        { id: '5', name: 'Tagihan', icon: 'fas fa-receipt' },
        { id: '6', name: 'Kesehatan', icon: 'fas fa-heartbeat' },
        { id: '7', name: 'Pendidikan', icon: 'fas fa-graduation-cap' },
        { id: '8', name: 'Lainnya', icon: 'fas fa-ellipsis-h' }
      ]);
    }

    // Format response dengan fallback icon jika tidak ada
    const formattedCategories = categories?.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || 'fas fa-folder',
      color: cat.color || '#6B7280'
    })) || [];

    console.log('[Budget API] Categories loaded from database:', formattedCategories.length);
    res.json(formattedCategories);
    
  } catch (error) {
    console.error('[Budget API] Error in /categories:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
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