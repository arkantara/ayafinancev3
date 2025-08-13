const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const app = express();

// ─── Manual CORS (handles both preflight & actual requests) ───
app.use((req, res, next) => {
  const FRONTEND_URL = 'https://ayafinancev3.vercel.app';
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// ─── JSON body parsing ───
app.use(express.json());

// ─── Supabase client ───
const supabase = createClient(
  'https://jjieqhvfadoqkahpqdvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2MTE4MSwiZXhwIjoyMDY4MTM3MTgxfQ.lGGDQiSvem3sHEwFYhUQU4nvnM80TIOMdTTaa2LiBBo');

// ─── OpenAI client ───
const openai = new OpenAI({
  apiKey: 'AIzaSyCGwKUderqu6J_9JKdQ-7ILPokFJ7apsPo',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
  });

// ─── Chat endpoint ───
app.post('/api/chat', async (req, res) => {
  // ─── LOGGING untuk debug ───
  console.log('🔥 /api/chat called, body =', req.body);
  console.log('   SUPABASE_URL=', 'https://jjieqhvfadoqkahpqdvl.supabase.co');
  console.log('   SUPABASE_KEY present?', !!'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2MTE4MSwiZXhwIjoyMDY4MTM3MTgxfQ.lGGDQiSvem3sHEwFYhUQU4nvnM80TIOMdTTaa2LiBBo');
  console.log('   GEMINI_API_KEY present?', !!'AIzaSyCGwKUderqu6J_9JKdQ-7ILPokFJ7apsPo');

  try {
    const { message, userId } = req.body;

    // … sisa kode Supabase + OpenAI-mu di sini …
    let context = '';
    if (/laporan|transaksi/i.test(message)) {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);
      if (!error) context = `Data transaksi user: ${JSON.stringify(transactions)}`;
    }

    const prompt = context
      ? `${context}\nUser: ${message}\nAI:`
      : `User: ${message}\nAI:`;

      const completion = await openai.chat.completions.create({
        model: 'gemini-2.5-flash',
        messages: [
          { role: 'system', content: '…' },
          { role: 'user',   content: prompt }
        ],
        max_tokens: 500
      });
    
      // pull out the string
      const reply = completion.choices[0].message.content;
      return res.json({ reply });

  } catch (err) {
    console.error('❌ Error in /api/chat:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// ─── Start server pada port dari Railway ───
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
