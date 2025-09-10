# Setup Environment Variables di Vercel

Untuk membuat login bekerja di Vercel, Anda perlu menambahkan environment variables berikut di Vercel Dashboard:

## Langkah-langkah:

1. **Buka Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Pilih project: `ayafinancev3`

2. **Tambahkan Environment Variables**
   - Klik tab "Settings"
   - Pilih "Environment Variables"
   - Tambahkan variabel berikut:

   ```
   SUPABASE_URL = https://jjieqhvfadoqkahpqdvl.supabase.co
   SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjExODEsImV4cCI6MjA2ODEzNzE4MX0.8rwAFQew3HbzdBgoseq_DX-R6YwJB2Fk5OMgm4KrmBM
   ```

3. **Redeploy**
   - Setelah menambahkan environment variables
   - Klik "Deployments" tab
   - Redeploy deployment terakhir

## Test Endpoints:

Setelah setup, test endpoint berikut:
- Config: https://ayafinancev3.vercel.app/config.js
- Health: https://ayafinancev3.vercel.app/health  
- Login: https://ayafinancev3.vercel.app/login.html

## Deployment URLs:

- **Railway (Production)**: https://ayafinancev3-production.up.railway.app
- **Vercel (Staging)**: https://ayafinancev3.vercel.app

Kedua deployment akan memiliki fungsi yang sama setelah environment variables di-setup dengan benar.
