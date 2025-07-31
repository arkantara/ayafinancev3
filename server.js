const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const app = express();


const cors = require('cors');
app.use(cors({
  origin: 'https://ayafinancev3.vercel.app',      // domain tempat frontend-mu deploy
  methods: ['GET','POST','OPTIONS'],               // tambahkan OPTIONS
  allowedHeaders: ['Content-Type','Authorization'] // authorize header jika perlu
}));
//app.options('*', cors());

app.use(bodyParser.json());
// Supabase setup
const supabase = createClient(
  'https://jjieqhvfadoqkahpqdvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2MTE4MSwiZXhwIjoyMDY4MTM3MTgxfQ.lGGDQiSvem3sHEwFYhUQU4nvnM80TIOMdTTaa2LiBBo'
);

// OpenAI setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

app.post('/api/chat', async (req, res) => {
  const { message, userId } = req.body;
  let context = '';

  if (/laporan|transaksi/i.test(message)) {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    context = `Data transaksi user: ${JSON.stringify(transactions)}`;
  }

  const prompt = context
    ? `${context}\nUser: ${message}\nAI:`
    : `User: ${message}\nAI:`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Kamu adalah asisten keuangan aplikasi ayaFinance. Jawab sesuai data jika ada.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500
      });
      const reply = completion.choices[0].message.content;
  res.json({ reply });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => 
  console.log(`Server running on port ${PORT}`)
);
