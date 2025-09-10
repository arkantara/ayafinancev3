# 🚨 STAGING NOTES DEBUG CHECKLIST

## Issue: Notes tidak tersimpan ke database Supabase di staging

### Error: "Gagal menyimpan note. Menggunakan penyimpanan lokal sebagai backup."

### Root Cause Analysis:

#### 1. Environment Variables di Vercel
Check di Vercel Settings → Environment Variables:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here (if needed)
NODE_ENV=production
```

#### 2. Database Migration Status
Table `notes` harus ada di staging Supabase:
- Run SQL: `database/migration_notes_safe.sql`
- Check table exists: SELECT * FROM notes;

#### 3. RLS Policies
Disable RLS for development testing:
```sql
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey;
```

#### 4. API Endpoint Test
Test direct API call to staging:
```bash
curl -X POST https://your-staging-url.vercel.app/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content","category":"test","type":"text"}'
```

### Debug Steps:

#### Step 1: Verify Environment Variables
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add missing variables if needed
3. Redeploy after adding env vars

#### Step 2: Run Database Migration
In staging Supabase SQL Editor:
```sql
-- Copy and run: database/migration_notes_safe.sql
-- Then disable constraints for testing:
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey;
```

#### Step 3: Test API Response
Check browser console for actual error details:
- Network tab for API call status
- Console for error messages

### Expected Fix:
After env vars + migration → Notes should save to database

---
**Next Action:** Check Vercel environment variables first
