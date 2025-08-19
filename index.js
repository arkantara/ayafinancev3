const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

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

// Import dan gunakan route transaksi
const transactionRoutes = require('./api/transactions');
app.use('/api/transactions', transactionRoutes);

// Import dan gunakan route auth
const authRoutes = require('./api/auth');
app.use('/api/auth', authRoutes);

// Import dan gunakan route budgets
const budgetRoutes = require('./api/budgets');
app.use('/api/budgets', budgetRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Redirect root to dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard.html');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));