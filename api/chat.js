import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

<<<<<<< HEAD
const supabase = createClient('https://jjieqhvfadoqkahpqdvl.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2MTE4MSwiZXhwIjoyMDY4MTM3MTgxfQ.lGGDQiSvem3sHEwFYhUQU4nvnM80TIOMdTTaa2LiBBo');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
  });
  export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
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
  
    // ────── Tambahkan prompt builder ──────
    const prompt = context
      ? `${context}\nUser: ${message}\nAI:`
      : `User: ${message}\nAI:`;
  
      const response = await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
                role: "user",
                content: "Explain to me how AI works",
            },
        ],
    });
    
    console.log(response.choices[0].message);
  
    // ────── Kirim balik hasil ke frontend ──────
    const reply = completion.choices[0].message.content;
    res.status(200).json({ reply });
  }
=======
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
>>>>>>> e0c4c491ffb3c5d82991964fffcacd397cd65b8f
