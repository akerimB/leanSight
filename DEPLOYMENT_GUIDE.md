# 🚀 Vercel Deployment Troubleshooting Guide

## Quick Setup Checklist

### 1. Database Setup (Required First!)

**Option A: Vercel Postgres (Recommended)**
```bash
# 1. Go to your Vercel project dashboard
# 2. Click "Storage" tab
# 3. Click "Create Database" > "Postgres"
# 4. Copy the DATABASE_URL connection string
```

**Option B: Supabase (Free Alternative)**
```bash
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Go to Settings > Database
# 4. Copy connection string (use "Session pooler" mode)
```

### 2. Environment Variables Setup

Add these in Vercel Dashboard > Settings > Environment Variables:

```env
DATABASE_URL=postgresql://username:password@host:5432/database
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-random-string-here
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Deploy Settings

In Vercel Dashboard > Settings > General:
- **Framework Preset**: Next.js
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Common Error Solutions

### Error: "Prisma Client not found"
**Solution:**
```bash
# Update package.json postinstall script
"postinstall": "prisma generate"
```

### Error: "Database connection failed"
**Cause:** Missing or incorrect DATABASE_URL
**Solution:**
1. Verify DATABASE_URL format: `postgresql://user:pass@host:port/db`
2. Test connection from local environment
3. Ensure database allows external connections

### Error: "Build failed with exit code 1"
**Common causes:**
1. TypeScript errors (we've disabled them)
2. Missing environment variables
3. Prisma schema issues

**Check Vercel logs:**
1. Go to Vercel Dashboard > Deployments
2. Click failed deployment
3. Check "Build Logs" tab

### Error: "Function execution timeout"
**Solution:** Already added in vercel.json:
```json
{
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30
    }
  }
}
```

### Error: "Module not found: prisma/client"
**Solution:** Ensure postinstall runs:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

## Step-by-Step Deployment

### 1. Set up Database
Choose **Vercel Postgres** for simplest setup:
- Vercel Dashboard > Storage > Create Database

### 2. Configure Environment Variables
```env
DATABASE_URL=your-vercel-postgres-url
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generated-secret-key
```

### 3. Deploy
- Git push triggers auto-deployment
- Or manually trigger from Vercel Dashboard

### 4. Initialize Database
After first successful deployment:
```bash
# If using external database, run migrations
npx prisma db push
```

## Debugging Tips

### Check Build Logs
1. Vercel Dashboard > Deployments
2. Click on failed deployment
3. Expand "Build Logs"

### Test Locally First
```bash
npm run build
```

### Verify Environment Variables
```bash
# In Vercel Dashboard, check all three environments:
# - Production
# - Preview  
# - Development
```

## Need Help?

If you're still getting errors, please share:
1. The exact error message from Vercel build logs
2. Your environment variables setup (without revealing actual values)
3. Which database option you're using

Common successful deployment flow:
1. ✅ Database created and accessible
2. ✅ Environment variables set correctly
3. ✅ Code builds locally with `npm run build`
4. ✅ Git pushed to GitHub
5. ✅ Vercel auto-deploys successfully 