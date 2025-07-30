import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

const supabase = createClient('https://jjieqhvfadoqkahpqdvl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2MTE4MSwiZXhwIjoyMDY4MTM3MTgxfQ.lGGDQiSvem3sHEwFYhUQU4nvnM80TIOMdTTaa2LiBBo');
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
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
  res.status(200).json({ reply });
}