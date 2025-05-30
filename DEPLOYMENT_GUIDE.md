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
# 5. IMPORTANT: Use the connection pooling URL, not direct connection
```

**Supabase Connection String Format:**
```env
# CORRECT - Use pooling connection (port 6543)
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:6543/postgres?pgbouncer=true"

# INCORRECT - Direct connection (port 5432) - causes build errors
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

### 2. Environment Variables Setup

Add these in Vercel Dashboard > Settings > Environment Variables:

```env
DATABASE_URL=postgresql://username:password@host:6543/database?pgbouncer=true
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

## Database Setup After Deployment

**IMPORTANT:** Database schema setup must happen AFTER successful deployment:

### For Supabase:
1. **Deploy first** (without database operations)
2. **After successful deployment**, run database setup:
```bash
# Option A: Use Vercel CLI
npx vercel env pull .env.production
npm run db:setup

# Option B: Use Supabase Dashboard
# Go to Supabase Dashboard > SQL Editor
# Run your Prisma schema SQL manually
```

### For Vercel Postgres:
1. Deploy first
2. Go to Vercel Dashboard > Storage > Your Database
3. Run: `npx prisma db push` from your local environment

## Common Error Solutions

### Error: "Can't reach database server during build"
**Cause:** Trying to connect to database during build
**Solution:** ✅ FIXED - Updated vercel-build to only generate Prisma client

### Error: "P1001: Can't reach database server"
**Causes:**
1. Wrong connection string format (use pooling for Supabase)
2. Database not allowing external connections
3. Incorrect credentials

**Solutions:**
1. **For Supabase**: Use connection pooling URL (port 6543, not 5432)
2. **Check credentials**: Verify username/password
3. **Test connection**: Use a database client to test

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

**OR** for Supabase:
- Create project on Supabase
- **IMPORTANT**: Copy the pooling connection string (port 6543)

### 2. Configure Environment Variables
```env
DATABASE_URL=your-database-url-with-pooling
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generated-secret-key
```

### 3. Deploy (Build Only)
- Git push triggers auto-deployment
- Build will only generate Prisma client, not connect to database

### 4. Initialize Database (After Deploy)
After first successful deployment:
```bash
# Run database setup separately
npm run db:setup
```

## Debugging Tips

### Check Build Logs
1. Vercel Dashboard > Deployments
2. Click on failed deployment
3. Expand "Build Logs"

### Test Connection String
```bash
# Test your connection string locally first
npx prisma db push
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
5. ✅ Vercel deploys successfully (build only)
6. ✅ Database schema pushed separately 