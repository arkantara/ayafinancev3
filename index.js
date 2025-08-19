const express = require('express');
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
    res.json({ success: true, message: 'Login berhasil', user });
  } else {
    res.json({ success: false, message: 'Username/Email atau password salah' });
  }
});

// Import dan gunakan route transaksi
const transactionRoutes = require('./api/transactions');
app.use('/api/transactions', transactionRoutes);

// Import dan gunakan route categories
const categoryRoutes = require('./api/categories');
app.use('/api/categories', categoryRoutes);

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
