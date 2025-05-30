# LeanSight 📊

**Advanced Analytics Platform for Organizational Assessment**

LeanSight is a comprehensive platform that enables organizations to conduct in-depth assessments across multiple dimensions and sectors, providing actionable insights through advanced analytics and AI-powered recommendations.

## 🚀 Features

### Phase 1: Core Assessment Platform
- **Multi-dimensional Assessments** - Evaluate organizations across various business dimensions
- **Sector-specific Evaluations** - Tailored assessment criteria for different industries  
- **Evidence Management** - Upload and manage supporting documentation
- **Real-time Collaboration** - Multiple users can work on assessments simultaneously
- **Role-based Access Control** - Admin, Expert, and User roles with appropriate permissions

### Phase 2: Advanced Analytics & Insights
- **Performance Dashboard** - KPI tracking with trend analysis and benchmarking
- **Comparative Analysis** - Peer comparisons and sector benchmarking with radar charts
- **Gap Analysis** - Identify improvement opportunities with priority matrices
- **Trend Analytics** - Historical performance tracking and forecasting
- **Interactive Visualizations** - Rich charts and graphs using Recharts

### Phase 3: AI-Powered Features  
- **Context-Enhanced Chat** - AI assistant with assessment context awareness
- **Intelligent Recommendations** - ML-powered suggestions for improvement
- **Automated Insights** - AI-generated analysis and action plans

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Material-UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: NextAuth.js with bcrypt
- **AI Integration**: OpenAI GPT-4, Anthropic Claude
- **Charts**: Recharts for data visualization
- **Deployment**: Vercel with GitHub integration

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (for production)

## 🚦 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/your-username/leansight.git
cd leansight
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="your-database-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 4. Set up the database
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
leansight/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── analytics/         # Analytics dashboard
│   ├── assessment/        # Assessment pages
│   ├── dashboard/         # Main dashboard
│   └── components/        # Shared components
├── components/            # React components
│   ├── analytics/         # Analytics-specific components
│   ├── ui/               # Reusable UI components
│   └── forms/            # Form components
├── prisma/               # Database schema and migrations
├── lib/                  # Utility functions
└── public/              # Static assets
```

## 📊 Analytics Features

### Performance Dashboard
- Overall score tracking with trend indicators
- Assessment progress monitoring  
- Sector benchmarking and rankings
- Time-to-completion analytics
- User engagement metrics

### Comparative Analysis
- Peer company comparisons
- Multi-level benchmarking (sector/industry/best-in-class)
- Interactive radar charts
- Dimension-level gap analysis

### Gap Analysis
- Priority-based improvement identification
- Impact vs effort matrices  
- Actionable recommendations with timelines
- ROI projections for opportunities

## 🔐 Security

- JWT-based authentication
- Role-based access control
- Input validation with Zod
- SQL injection protection via Prisma
- XSS protection with Content Security Policy

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**:
- Visit [vercel.com](https://vercel.com)
- Import your GitHub repository
- Configure environment variables
- Deploy automatically

3. **Set up production database**:
- Use Vercel Postgres, PlanetScale, or Supabase
- Update `DATABASE_URL` in Vercel environment variables

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.vercel.app" 
NEXTAUTH_SECRET="your-production-secret"
```

## 🧪 Testing

```bash
npm test
```

## 📚 API Documentation

### Assessment APIs
- `GET /api/assessments` - List assessments
- `POST /api/assessments` - Create assessment  
- `PUT /api/assessments/[id]` - Update assessment
- `DELETE /api/assessments/[id]` - Delete assessment

### Analytics APIs  
- `GET /api/analytics/performance-metrics` - Performance dashboard data
- `GET /api/analytics/comparative-analysis` - Comparative analysis data
- `GET /api/analytics/gap-analysis` - Gap analysis data
- `GET /api/analytics/trends` - Trend analysis data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## 🗺️ Roadmap

- [ ] Advanced AI recommendations
- [ ] Custom dashboard builder  
- [ ] Integration with external data sources
- [ ] Mobile application
- [ ] Advanced reporting and exports
- [ ] Multi-language support

---

Built with ❤️ using Next.js and Modern Web Technologies 