const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(bodyParser.json());

// Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// OpenAI setup
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

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

  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Kamu adalah asisten keuangan aplikasi ayaFinance. Jawab sesuai data jika ada.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500
  });

  const reply = completion.data.choices[0].message.content;
  res.json({ reply });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));