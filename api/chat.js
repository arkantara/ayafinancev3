import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

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
  }


