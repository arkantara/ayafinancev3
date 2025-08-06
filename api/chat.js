import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_KEY);
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
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
  
      const openai = new OpenAI({
        apiKey: "GEMINI_API_KEY",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });
    
    const response = await openai.chat.completions.create({
    model: "gemini-2.5-flash",
    reasoning_effort: "low",
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
            role: "user",
            content: "Explain to me how AI works",
        },
    ],
});

console.log(response.choices[0].message);
  }

