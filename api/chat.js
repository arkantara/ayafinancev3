import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, userId } = req.body;
    let context = '';

    // Cek jika user tanya tentang transaksi/laporan
    if (/laporan|transaksi|pengeluaran|pemasukan|bulan/i.test(message)) {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);
      
      if (transactions && transactions.length > 0) {
        context = `Data transaksi user: ${JSON.stringify(transactions)}`;
      }
    }

    // Build prompt yang benar
    const prompt = context
      ? `${context}\n\nUser bertanya: ${message}\n\nJawab berdasarkan data transaksi di atas dalam bahasa Indonesia.`
      : `User bertanya: ${message}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Kamu adalah asisten keuangan ayaFinance. Jawab pertanyaan user dalam bahasa Indonesia. Jika ada data transaksi, analisis dan berikan insight yang berguna." 
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500
    });

    const reply = response.choices[0].message.content;
    res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
