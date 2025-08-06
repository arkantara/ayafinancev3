import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_KEY);
const openai = new OpenAI({
  apiKey: 'AIzaSyCGwKUderqu6J_9JKdQ-7ILPokFJ7apsPo',
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
  
    const completion = await openai.chat.completions.create({
      model: 'gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content:
            'Kamu adalah asisten keuangan aplikasi ayaFinance. Jawab sesuai data jika ada.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500
    });
  
    // ────── Kirim balik hasil ke frontend ──────
    const reply = completion.choices[0].message.content;
    res.status(200).json({ reply });
  }

