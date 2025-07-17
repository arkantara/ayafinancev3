// filepath: /public/auth.js
// Ganti URL dan anon key dengan milik Anda dari dashboard Supabase
const supabase = supabase.createClient('aws-0-ap-southeast-1.pooler.supabase.com', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjExODEsImV4cCI6MjA2ODEzNzE4MX0.8rwAFQew3HbzdBgoseq_DX-R6YwJB2Fk5OMgm4KrmBM');

// Contoh fungsi register
async function register(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert('Gagal daftar: ' + error.message);
  } else {
    alert('Registrasi berhasil! Silakan cek email Anda.');
  }
}

// Contoh fungsi login
async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert('Login gagal: ' + error.message);
  } else {
    alert('Login berhasil!');
  }
}