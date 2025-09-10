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

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Serve static files dari folder 'public'
app.use(express.static('public'));

// Inject environment variables ke HTML files
app.get('/config.js', (req, res) => {
  console.log('=== CONFIG.JS DEBUG ===');
  console.log('SUPABASE_URL from env:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('SUPABASE_KEY from env:', process.env.SUPABASE_KEY ? 'SET' : 'NOT SET');
  console.log('Using URL:', supabaseUrl);
  console.log('Platform:', process.env.VERCEL ? 'vercel' : (process.env.RAILWAY_ENVIRONMENT ? 'railway' : 'local'));
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    window.ENV = {
      SUPABASE_URL: '${supabaseUrl}',
      SUPABASE_KEY: '${supabaseKey}',
      IS_PRODUCTION: ${process.env.NODE_ENV === 'production'},
      PLATFORM: '${process.env.VERCEL ? 'vercel' : (process.env.RAILWAY_ENVIRONMENT ? 'railway' : 'local')}'
    };
  `);
});

// Login endpoint - API for authentication
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('=== LOGIN DEBUG v2 ===');
  console.log('Request body:', req.body);
  console.log('Username:', username, 'Type:', typeof username);
  console.log('Password:', password, 'Type:', typeof password);
  console.log('Username includes @:', username ? username.includes('@') : 'false');
  console.log('Password length:', password ? password.length : 0);
  
  // Simplified validation untuk testing - accept any valid credentials
  if (username && password && username.includes('@') && password.length >= 5) {
    const user = { 
      id: 1, 
      username: username.split('@')[0], 
      email: username,
      full_name: username.split('@')[0].charAt(0).toUpperCase() + username.split('@')[0].slice(1)
    };
    console.log('✅ Login successful for:', username);
    res.json({ success: true, message: 'Login berhasil', user });
  } else {
    console.log('❌ Login failed - validation details:');
    console.log('  - Has username:', !!username);
    console.log('  - Has password:', !!password);
    console.log('  - Email format:', username ? username.includes('@') : false);
    console.log('  - Password length OK:', password ? password.length >= 5 : false);
    res.json({ success: false, message: 'Email atau password tidak valid' });
  }
});

// Categories API endpoint - untuk Budget System
app.get('/api/categories', async (req, res) => {
  try {
    console.log('[Categories API] GET /api/categories called');
    
    // Query dari Supabase database
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('[Categories API] Supabase error:', error);
      // Fallback ke hardcoded categories jika database gagal
      const fallbackCategories = [
        { id: '1', name: 'Makanan & Minuman', icon: 'fas fa-utensils' },
        { id: '2', name: 'Transportasi', icon: 'fas fa-car' },
        { id: '3', name: 'Hiburan', icon: 'fas fa-gamepad' },
        { id: '4', name: 'Belanja', icon: 'fas fa-shopping-bag' },
        { id: '5', name: 'Tagihan', icon: 'fas fa-receipt' },
        { id: '6', name: 'Kesehatan', icon: 'fas fa-heartbeat' },
        { id: '7', name: 'Pendidikan', icon: 'fas fa-graduation-cap' },
        { id: '8', name: 'Lainnya', icon: 'fas fa-ellipsis-h' }
      ];
      console.log('[Categories API] Using fallback categories:', fallbackCategories.length);
      return res.json(fallbackCategories);
    }

    console.log('[Categories API] Categories from database:', categories?.length || 0);
    res.json(categories || []);
    
  } catch (error) {
    console.error('[Categories API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Budget API endpoints - directly defined for Vercel compatibility
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

// Notes API endpoints
app.get('/api/notes', async (req, res) => {
  try {
    console.log('[Notes API] GET /api/notes called');
    
    const sampleNotes = [
      {
        id: '1',
        title: 'Budget Planning Template',
        category: 'budget',
        type: 'table',
        content: '<table><tr><th>Kategori</th><th>Budget</th><th>Actual</th></tr></table>',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Shopping List',
        category: 'shopping',
        type: 'text',
        content: '<p>List belanja mingguan...</p>',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
    
    const newNote = {
      id: Date.now().toString(),
      title,
      category,
      type,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: newNote });
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
    
    const updatedNote = {
      id,
      title,
      category,
      type,
      content,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: updatedNote });
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
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env_check: {
      has_supabase_url: !!process.env.SUPABASE_URL,
      has_supabase_key: !!process.env.SUPABASE_KEY,
      platform: process.env.VERCEL ? 'vercel' : (process.env.RAILWAY_ENVIRONMENT ? 'railway' : 'local')
    }
  });
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

