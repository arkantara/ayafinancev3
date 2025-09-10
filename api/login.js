// Vercel Serverless Function untuk login
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;
  
  console.log('=== VERCEL LOGIN API DEBUG ===');
  console.log('Request body:', req.body);
  console.log('Username:', username, 'Type:', typeof username);
  console.log('Password:', password, 'Type:', typeof password);
  console.log('Username includes @:', username ? username.includes('@') : 'false');
  console.log('Password length:', password ? password.length : 0);
  
  // Simplified validation untuk testing - accept any valid credentials
  if (username && password && username.includes('@') && password.length >= 5) {
    const user = { 
      id: 1, 
      username: username.split('@')[0], 
      email: username,
      full_name: username.split('@')[0].charAt(0).toUpperCase() + username.split('@')[0].slice(1)
    };
    console.log('✅ Login successful for:', username);
    res.json({ success: true, message: 'Login berhasil', user });
  } else {
    console.log('❌ Login failed - validation details:');
    console.log('  - Has username:', !!username);
    console.log('  - Has password:', !!password);
    console.log('  - Email format:', username ? username.includes('@') : false);
    console.log('  - Password length OK:', password ? password.length >= 5 : false);
    res.json({ success: false, message: 'Email atau password tidak valid' });
  }
}
