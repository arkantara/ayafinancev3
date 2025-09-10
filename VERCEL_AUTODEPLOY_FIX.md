# 🔧 VERCEL AUTO-DEPLOY FIX GUIDE

## Issue: Vercel not auto-deploying, Railway works fine

### Root Cause Options:
1. **Webhook Issue** - GitHub → Vercel webhook broken
2. **Branch Mismatch** - Vercel watching wrong branch  
3. **Build Settings** - Incorrect build configuration
4. **Repository Connection** - Git integration disconnected

### Quick Fixes:

#### Fix 1: Check Branch Settings
1. Vercel Dashboard → Project Settings → Git
2. **Production Branch** should be: `main`
3. **Deploy Hooks** should be enabled

#### Fix 2: Reconnect Repository  
1. Settings → Git → Connected Git Repository
2. Click **Disconnect** → **Reconnect**
3. Reauthorize GitHub access

#### Fix 3: Add Deploy Hook (Alternative)
1. Settings → Git → Deploy Hooks
2. Create new hook → Copy URL
3. GitHub → Repository → Settings → Webhooks
4. Add webhook with Vercel URL

#### Fix 4: Environment Variables
Check if missing env vars block deploy:
- SUPABASE_URL
- SUPABASE_ANON_KEY  
- SUPABASE_SERVICE_ROLE_KEY

### Manual Deploy (Immediate Solution):
1. Vercel Dashboard → Deployments
2. Click "Redeploy" on latest
3. Should deploy current GitHub state

### Railway Success Confirms:
✅ Code is working properly
✅ GitHub pushes are successful  
✅ Issue is Vercel-specific, not code

---
**Recommendation:** Use manual redeploy for now, fix auto-deploy later
