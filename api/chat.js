import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

const supabase = createClient('https://jjieqhvfadoqkahpqdvl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjExODEsImV4cCI6MjA2ODEzNzE4MX0.8rwAFQew3HbzdBgoseq_DX-R6YwJB2Fk5OMgm4KrmBM');
const openai = new OpenAIApi(new Configuration({ apiKey: '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' }));

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
