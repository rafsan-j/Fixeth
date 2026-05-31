# 🚀 FIXETH VERCEL DEPLOYMENT GUIDE

**Status:** ✅ Production-Ready for Vercel

---

## Overview

Fixeth is a **Next.js 14** application that deploys natively to **Vercel** — no additional configuration needed.

### What Vercel Provides
- ✅ Global CDN with 350+ regions
- ✅ Automatic HTTPS & DDoS protection
- ✅ Serverless API routes (auto-scaling)
- ✅ Edge Functions for middleware
- ✅ Background jobs via cron routes
- ✅ Automatic deployments on git push
- ✅ Preview deployments for PRs

---

## Prerequisites

1. **GitHub Account** — https://github.com/signup
2. **Vercel Account** — https://vercel.com/signup (free tier sufficient)
3. **Supabase Project** — https://supabase.com/dashboard (for PostgreSQL + pgvector)
4. **OAuth Credentials** (optional but recommended):
   - Google OAuth: https://console.developers.google.com
   - GitHub OAuth: https://github.com/settings/developers
5. **API Keys** (optional for MVP):
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com

---

## Step-by-Step Deployment

### Step 1: Prepare GitHub Repository

```bash
# Clone locally (if not already done)
git clone https://github.com/YOUR_USERNAME/fixeth.git
cd fixeth

# Ensure you're on main branch
git branch -M main

# Push all commits
git push -u origin main
```

**Verify:** https://github.com/YOUR_USERNAME/fixeth shows your latest code

---

### Step 2: Create Vercel Project

#### **Option A: Dashboard (Recommended)**

1. Visit **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Authenticate with GitHub
4. Find & select `fixeth` repository
5. Click **"Import"**

#### **Option B: CLI**

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

### Step 3: Configure Project Settings

In the Vercel dashboard, after import:

#### **Build Settings**
- **Framework:** Next.js ✅ (auto-detected)
- **Build Command:** `npm run build` ✅ (auto-filled)
- **Output Directory:** `.next` ✅ (auto-filled)
- **Root Directory:** `./` ✅ (root of repo)

#### **Environment Variables**

Add these 13 variables via **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL = https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY = YOUR_SERVICE_ROLE_KEY
NEXTAUTH_SECRET = (run: openssl rand -base64 32)
NEXTAUTH_URL = https://YOUR_DEPLOYMENT.vercel.app
GOOGLE_CLIENT_ID = YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = YOUR_GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID = YOUR_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET = YOUR_GITHUB_CLIENT_SECRET
OPENAI_API_KEY = sk-YOUR_KEY
ANTHROPIC_API_KEY = sk-ant-YOUR_KEY
YOUTUBE_DATA_API_KEY = YOUR_API_KEY
PLATFORM_GEMINI_KEY = YOUR_GEMINI_KEY
```

**📌 Important:**
- `NEXT_PUBLIC_*` variables are visible in browser — use only for non-sensitive data
- All other variables are server-only and secure
- For each environment (Preview, Staging, Production), you can set different values

---

### Step 4: Deploy

Click **"Deploy"** button in Vercel dashboard.

**Wait for:**
- ✅ Build completes (2–3 minutes)
- ✅ API routes are analyzed
- ✅ Production URL generated

**Your app is now live at:** `https://YOUR_PROJECT.vercel.app`

---

## Post-Deployment Verification

### 1. Test Health Endpoint

```bash
curl https://YOUR_DEPLOYMENT.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-29T10:30:00.000Z",
  "environment": "production",
  "vercel": true,
  "supabase": true
}
```

### 2. Test Navigation

- [ ] Visit https://YOUR_DEPLOYMENT.vercel.app
- [ ] Top bar renders (logo + nav toggles)
- [ ] Bottom nav renders (8 icon tabs)
- [ ] Theme toggle works (☀️ Light / 🌙 Dark)
- [ ] Language toggle works (EN / বাংলা)
- [ ] Dashboard loads (if authenticated)

### 3. Test Authentication

- [ ] Sign-up page loads: https://YOUR_DEPLOYMENT.vercel.app/signup
- [ ] Google OAuth button present
- [ ] GitHub OAuth button present
- [ ] Try signing up (will redirect to dashboard if successful)

### 4. Check Logs

```bash
# Stream real-time logs
vercel logs --tail

# Or view in dashboard: Vercel → Deployments → Logs
```

---

## Using Custom Domain

### 1. Add Domain

In Vercel **Settings → Domains**:
- Click **"Add Domain"**
 - Enter your domain: `fixeth.com` or `fixeth.vercel.app`
- Follow DNS setup instructions

### 2. Update Environment

After domain is verified, update:

```
NEXTAUTH_URL = https://fixeth.com  # (not .vercel.app)
NEXT_PUBLIC_APP_URL = https://fixeth.com
```

Redeploy:
```bash
git add .
git commit -m "Update domain config"
git push origin main
```

---

## Advanced: Enable Background Jobs

Create background job endpoint for job market scraper:

**Create:** `app/api/cron/job-market-scraper/route.ts`

```typescript
export const runtime = 'nodejs'; // Required for Vercel Cron
export const preferredRegion = 'auto';

export async function GET(req: Request) {
  // Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Your job market scraper logic here
    // await runJobMarketScraper();
    return Response.json({ success: true, timestamp: new Date() });
  } catch (err) {
    console.error('Cron job failed:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
```

Add to `vercel.json`:
```json
"crons": [
  {
    "path": "/api/cron/job-market-scraper",
    "schedule": "0 9 * * 1"
  }
]
```

Deploy:
```bash
git add .
git commit -m "Add background job"
git push origin main
```

---

## Performance Optimization

### Enable Edge Middleware

Vercel runs middleware at edge (lowest latency).

Update `middleware.ts`:
```typescript
export const config = {
  matcher: ['/dashboard/:path*', '/learn/:path*'],
};
```

This runs authentication checks at edge before hitting your serverless function.

### Configure Function Timeout

For long AI operations, increase timeout in `vercel.json`:

```json
{
  "functions": {
    "app/api/tutor/route.ts": {
      "maxDuration": 60
    }
  }
}
```

---

## Monitoring & Debugging

### 1. Vercel Dashboard

- **Deployments** → View all deploys + status
- **Analytics** → Web Vitals, traffic, errors
- **Logs** → Real-time server logs
- **Storage** → Blob storage usage (if using)

### 2. Check Errors

```bash
# Stream errors only
vercel logs --error

# See last 100 logs
vercel logs --limit 100
```

### 3. Preview Environment

Every git branch gets a preview URL:
```
https://fixeth-BRANCH.vercel.app
```

Create a branch to test before merging:
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# → Vercel auto-creates preview URL
```

---

## Rollback to Previous Deployment

If something breaks:

1. Go to **Vercel Dashboard → Deployments**
2. Find previous working deployment
3. Click **"..." → Promote to Production"**
4. **Done** — previous version is now live

---

## Cost Estimation

**Vercel Pricing (as of May 2026):**

| Resource | Free Tier | Pro ($20/month) |
|----------|-----------|---|
| Serverless Functions | 100 GB-hours/month | Unlimited |
| Edge Functions | 100k/month | 1M/month |
| Bandwidth | 100 GB/month | 1 TB/month |
| Databases | Not included | $0.25/GB |

**For Fixeth MVP:**
- Expected cost: **$0–$20/month** (free tier sufficient for 1k users)
- Scale up only when reaching production traffic

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
vercel build --yes

# Check logs for errors
vercel logs --tail
```

### Environment Variables Not Working

1. Verify variable names are EXACTLY correct (case-sensitive)
2. Rebuild project after adding variables: Vercel → **Deploy** → **Redeploy**
3. Check `NEXT_PUBLIC_*` prefix for client-side vars

### API Routes Return 404

1. Ensure file is at `app/api/[route]/route.ts`
2. File must export `GET`, `POST`, etc. functions
3. Restart local dev server

### Supabase Connection Fails

```bash
# Verify credentials locally first
npm run dev

# Then test on Vercel
curl https://YOUR_DEPLOYMENT.vercel.app/api/health
```

---

## Next Steps After Deployment

1. **Monitor** performance in Vercel Dashboard
2. **Set up** Sentry for error tracking (optional)
3. **Enable** Analytics in Vercel
4. **Configure** GitHub branch protection + Vercel checks
5. **Document** deployment process for team

---

## Git Workflow for Continuous Deployment

```bash
# Feature branch
git checkout -b feature/new-feature
git push origin feature/new-feature
# → Vercel auto-creates preview: https://fixeth-feature-new-feature.vercel.app

# Create PR, review preview
# → Approve & merge to main

# Automatic production deploy
# → Check https://fixeth.vercel.app
# → Done!
```

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs

---

*Last updated: May 29, 2026*
