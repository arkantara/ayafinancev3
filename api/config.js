// Vercel Serverless Function untuk config.js
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Environment variables dengan fallback
  const supabaseUrl = process.env.SUPABASE_URL || 'https://jjieqhvfadoqkahpqdvl.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjExODEsImV4cCI6MjA2ODEzNzE4MX0.8rwAFQew3HbzdBgoseq_DX-R6YwJB2Fk5OMgm4KrmBM';

  console.log('=== CONFIG API DEBUG ===');
  console.log('SUPABASE_URL from env:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('SUPABASE_KEY from env:', process.env.SUPABASE_KEY ? 'SET' : 'NOT SET');
  console.log('Platform: Vercel Serverless');

  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    window.ENV = {
      SUPABASE_URL: '${supabaseUrl}',
      SUPABASE_KEY: '${supabaseKey}',
      IS_PRODUCTION: true,
      PLATFORM: 'vercel-serverless'
    };
  `);
}
