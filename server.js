const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware untuk inject environment variables ke HTML files
app.use((req, res, next) => {
  // Hanya untuk file HTML
  if (req.path.endsWith('.html')) {
    const filePath = path.join(__dirname, 'public', req.path);
    
    // Cek apakah file ada
    if (fs.existsSync(filePath)) {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return next();
        }
        
        // Replace environment variable placeholders  
        let processedHtml = data;
        
        // Inject environment variables di script tag
        if (processedHtml.includes('<script>')) {
          const isProduction = process.env.NODE_ENV === 'production';
          const supabaseUrl = process.env.SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_KEY;
          
          // Validasi environment variables
          if (!supabaseUrl || !supabaseKey) {
            console.error('❌ Missing Supabase environment variables');
            console.error('💡 Make sure SUPABASE_URL and SUPABASE_KEY are set in Railway');
            return res.status(500).send('Server configuration error. Please contact administrator.');
          }
          
          const envScript = `
            <script>
              // Environment variables from Railway
              window.SUPABASE_URL = '${supabaseUrl}';
              window.SUPABASE_KEY = '${supabaseKey}';
              window.APP_ENV = '${isProduction ? 'production' : 'development'}';
              console.log('🚂 Environment:', window.APP_ENV);
              console.log('🔐 Supabase configured:', !!window.SUPABASE_URL && !!window.SUPABASE_KEY);
            </script>
          `;
          
          processedHtml = processedHtml.replace('<head>', `<head>${envScript}`);
        }
        
        res.send(processedHtml);
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

// Root route redirect ke dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard.html');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabaseConfigured: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_KEY
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ayaFinance server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Supabase URL: ${process.env.SUPABASE_URL ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🔑 Supabase Key: ${process.env.SUPABASE_KEY ? '✅ Configured' : '❌ Not configured'}`);
});
