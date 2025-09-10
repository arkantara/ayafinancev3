# Environment Variables Setup Guide

## ❌ Masalah yang Terjadi
```
⚠️  Missing environment variables: SUPABASE_URL, SUPABASE_KEY
⚠️  App will use fallback configuration for development
```

## ✅ Solusi yang Telah Diterapkan

### 1. Install dotenv package
```bash
npm install dotenv
```

### 2. Update index.js
Menambahkan konfigurasi dotenv di awal file:
```javascript
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env file
require('dotenv').config();

const app = express();
```

### 3. Buat file .env
```bash
# Development only - JANGAN COMMIT!
SUPABASE_URL=https://jjieqhvfadoqkahpqdvl.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
NODE_ENV=development
```

### 4. Update .env.example
File template untuk environment variables dengan instruksi setup.

### 5. Update .gitignore
File .env sudah ada di .gitignore untuk keamanan.

## 🔧 Setup untuk Development

1. **Copy template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env dengan kredensial Supabase:**
   ```bash
   SUPABASE_URL=your_actual_supabase_url
   SUPABASE_KEY=your_actual_supabase_key
   ```

3. **Jalankan server:**
   ```bash
   npm start
   ```

## 🚀 Setup untuk Production

### Vercel
Set environment variables di dashboard Vercel:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `NODE_ENV=production`

### Railway
Set environment variables di dashboard Railway:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `NODE_ENV=production`

### Heroku
```bash
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_KEY=your_key
heroku config:set NODE_ENV=production
```

## 🔒 Keamanan
- ✅ File .env tidak akan di-commit ke git
- ✅ Fallback values tetap ada untuk development
- ✅ Production menggunakan environment variables platform
- ✅ Sensitive data tidak terexpose di repository

## ✅ Hasil Setelah Fix
```
[dotenv@17.2.2] injecting env (4) from .env
✅ Budget routes loaded successfully  
✅ Notes routes loaded successfully
Server running on port 3000
```

**Tidak ada lagi warning missing environment variables!**
