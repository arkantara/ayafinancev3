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
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ─── OpenAI client ───
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ─── Chat endpoint ───
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    let context = '';

    // Jika user minta laporan/transaksi, ambil data Supabase
    if (/laporan|transaksi/i.test(message)) {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase error:', error);
      } else {
        context = `Data transaksi user: ${JSON.stringify(transactions)}`;
      }
    }

    // Bangun prompt untuk OpenAI
    const prompt = context
      ? `${context}\nUser: ${message}\nAI:`
      : `User: ${message}\nAI:`;

    // Panggil OpenAI Chat Completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah asisten keuangan aplikasi ayaFinance. Jawab sesuai data jika ada.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500
    });

    // Kirim balik jawaban AI
    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Start server pada port dari Railway ───
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
