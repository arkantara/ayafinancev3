export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug environment variables
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'OK' : 'MISSING');
  console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'OK' : 'MISSING');
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'OK' : 'MISSING');
  console.log('Request body:', req.body);

  try {
    const { message, userId } = req.body;
    
    // Test response sederhana dulu
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Hardcode API key untuk testing (SEMENTARA)
    const openai = new OpenAI({ 
      apiKey: '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'
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Kamu adalah asisten keuangan." },
        { role: "user", content: message }
      ],
      max_tokens: 100
    });

    const reply = response.choices[0].message.content;
    console.log('AI Reply:', reply);
    
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error details:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
