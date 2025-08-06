import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: process.env.GEMINI_API_KEY});

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

      +  const messages = [
+    { role: "system", content: "You are a helpful assistant." },
+    ...(context
+      ? [{ role: "system", content: context }]
+      : []),
+    { role: "user", content: message }
+  ];
+
+  const response = await openai.chat.completions.create({
+    model: "gemini-2.5-flash",      // atau "gemini-2.0-flash" kalau perlu
+    messages
+  });
+
+  // Ambil reply benar-benar dari `response`
+  const reply = response.choices[0].message.content;
+  console.log("AI reply:", reply);
+
+  return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
