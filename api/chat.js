import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const openai = new OpenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, userId } = req.body;
    let context = '';

    // 1) Ambil data transaksi jika user tanya laporan/transaksi
    if (/laporan|transaksi|pengeluaran|pemasukan|bulan/i.test(message)) {
      const { data: transactions, error: supaError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (supaError) {
        console.error('Supabase error:', supaError);
      }
      else if (transactions.length) {
        context = `Data transaksi user:\n${JSON.stringify(transactions)}`;
      }
    }

    // 2) Susun `messages` untuk Gemini
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...(
        context
          ? [{ role: 'system', content: context }]
          : []
      ),
      { role: 'user', content: message }
    ];

    // 3) Panggil Gemini AI
    const response = await openai.chat.completions.create({
      model: 'gemini-2.5-flash',
      messages
    });

    // 4) Ambil balasan
    const reply = response.choices?.[0]?.message?.content ?? '';
    console.log('AI reply:', reply);

    return res.status(200).json({ reply });
  }
  catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
