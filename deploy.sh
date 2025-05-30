#!/bin/bash

# LeanSight Deployment Script
echo "🚀 LeanSight Deployment Setup"
echo "================================"

# Check if GitHub CLI is available and authenticated
if command -v gh &> /dev/null; then
    echo "📱 GitHub CLI detected"
    
    # Check authentication
    if gh auth status &> /dev/null; then
        echo "✅ GitHub CLI authenticated"
        
        # Create repository
        echo "📦 Creating GitHub repository..."
        gh repo create leansight --public --description "Advanced Analytics Platform for Organizational Assessment" --confirm
        
        # Add remote and push
        echo "⬆️  Pushing code to GitHub..."
        git remote add origin https://github.com/$(gh api user --jq .login)/leansight.git
        git push -u origin main
        
        echo "✅ Repository created and code pushed!"
        echo "🌐 GitHub repo: https://github.com/$(gh api user --jq .login)/leansight"
        
    else
        echo "❌ GitHub CLI not authenticated. Please run: gh auth login"
        exit 1
    fi
else
    echo "❌ GitHub CLI not found. Please install it or use manual setup."
    echo "📖 See README.md for manual setup instructions."
    exit 1
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://vercel.com"
echo "2. Sign in and click 'New Project'"
echo "3. Import your leansight repository"
echo "4. Add environment variables:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_URL"
echo "   - NEXTAUTH_SECRET"
echo "5. Deploy! 🚀"
echo ""
echo "📚 For detailed instructions, see the README.md file." 