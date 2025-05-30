# LeanSight Development Workflow

## 🚀 Local Development to Vercel Deployment

### Prerequisites
- Node.js 18+ installed
- Git configured
- Vercel account connected to GitHub repository

### 1. Local Development Setup

```bash
# Clone the repository (if not already done)
git clone https://github.com/akerimB/leanSight.git
cd leanSight

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your local database credentials
```

### 2. Local Development Environment

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

### 3. Database Setup for Local Development

```bash
# For local development, you can use the same Supabase database
# or set up a local PostgreSQL database

# Push schema to database
npx prisma db push

# Optional: Seed the database
npm run seed
```

### 4. Development Workflow

#### Make Changes Locally
1. **Edit files** in your local editor
2. **Test changes** at http://localhost:3000
3. **Check console** for any errors
4. **Test functionality** thoroughly

#### Deploy to Vercel
```bash
# 1. Stage your changes
git add .

# 2. Commit with descriptive message
git commit -m "descriptive commit message"

# 3. Push to main branch
git push origin main

# 4. Vercel automatically deploys (usually takes 1-2 minutes)
```

### 5. Vercel Auto-Deployment

- **Trigger**: Every push to `main` branch
- **Build Process**: Automatic via GitHub integration
- **URL**: https://lean-sight.vercel.app
- **Build Logs**: Available in Vercel dashboard

### 6. Environment Variables in Vercel

Vercel uses these environment variables (already configured):
- `DATABASE_URL`: Supabase connection string
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Application URL

### 7. Debugging Deployed Application

```bash
# Check deployment status
vercel list

# View logs (if Vercel CLI installed)
vercel logs

# Or check Vercel dashboard at vercel.com
```

### 8. Common Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server locally

# Database
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema changes
npx prisma studio       # Open database browser

# Deployment
git push origin main    # Deploy to Vercel automatically
```

### 9. Best Practices

#### Before Committing
- [ ] Test changes locally
- [ ] Check console for errors
- [ ] Verify database connections work
- [ ] Test authentication flows

#### Commit Messages
```bash
git commit -m "feat: add new analytics dashboard"
git commit -m "fix: resolve sectors page descriptor count issue"
git commit -m "refactor: optimize database queries"
```

#### Branch Strategy
- `main`: Production branch (auto-deploys to Vercel)
- `dev`: Development branch (optional)
- `feature/xxx`: Feature branches

### 10. Troubleshooting

#### If deployment fails:
1. Check Vercel build logs
2. Verify all dependencies are in package.json
3. Check environment variables are set
4. Ensure database is accessible

#### If local development has issues:
1. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
2. Regenerate Prisma client: `npx prisma generate`
3. Check .env.local has correct values

### 11. Current Setup Status

✅ **Repository**: https://github.com/akerimB/leanSight
✅ **Production URL**: https://lean-sight.vercel.app
✅ **Database**: Supabase PostgreSQL
✅ **Auto-deployment**: Configured via GitHub integration
✅ **Environment**: Production ready

## Quick Start for Changes

```bash
# 1. Make changes in your editor
# 2. Test locally with npm run dev
# 3. When ready to deploy:
git add .
git commit -m "your change description"
git push origin main
# 4. Check https://lean-sight.vercel.app in 1-2 minutes
``` 