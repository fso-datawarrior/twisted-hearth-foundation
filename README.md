# The Ruths' Twisted Fairytale Halloween Bash

A modern, interactive website for The Ruths' annual Halloween party featuring RSVP management, photo galleries, guestbook, scavenger hunt, and comprehensive admin tools.

## 🎃 Overview

This is a full-stack web application built with React, TypeScript, and Supabase, designed to manage all aspects of The Ruths' annual Halloween party. The site features a gothic fairytale theme with dark aesthetics and provides both guest-facing and administrative functionality.

## ✨ Features

### Guest Features
- **RSVP System**: Complete registration with dietary preferences and guest management
- **Photo Gallery**: Upload, view, and interact with party photos
- **Guestbook**: Social messaging with reactions and replies
- **Scavenger Hunt**: Interactive game with 15 hidden hints across the site
- **Vignettes Gallery**: Modern carousel showcasing past years' themes
- **Notification System**: Real-time notifications for interactions and updates
- **Mobile-Optimized**: Responsive design for all devices

### Admin Features
- **Release Management System**: Complete version tracking and communication tools
- **Analytics Dashboard**: Comprehensive user engagement and performance metrics
- **Content Management**: Photo approval, guestbook moderation, and user management
- **Email Campaigns**: Automated email system with Mailjet integration
- **Notification Management**: System-wide notification controls

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router DOM** for navigation
- **Framer Motion** for animations
- **React Query** for data fetching

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** database with Row Level Security
- **Edge Functions** for serverless API endpoints
- **Mailjet** for email delivery

### Deployment
- **Firebase Hosting** for static site hosting
- **GitHub Actions** for CI/CD
- **Workload Identity** for secure deployments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/twisted-hearth-foundation.git
   cd twisted-hearth-foundation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_MAILJET_API_KEY`
   - `VITE_MAILJET_SECRET_KEY`

4. **Database Setup**
   ```bash
   # Run migrations
   npx supabase db push
   
   # Seed initial data
   npx supabase db seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components (DO NOT MODIFY)
│   ├── admin/          # Admin-specific components
│   └── settings/       # User settings components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and APIs
├── contexts/           # React context providers
├── integrations/       # External service integrations
└── shaders/            # WebGL shaders for effects

supabase/
├── migrations/         # Database migrations
├── functions/          # Edge functions
└── tests/             # Database tests

docs/                   # Comprehensive documentation
├── DATABASE/          # Database documentation
├── DEPLOYMENT-PROD/   # Production deployment guides
├── DEPLOYMENT-WORKFLOWS/ # Development workflows
└── FUTURE-FEATURES/   # Planned features
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run build:prod` - Build and compress assets
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Database Management

```bash
# Apply migrations
npx supabase db push

# Reset database
npx supabase db reset

# Generate types
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### Edge Functions

```bash
# Deploy all functions
npx supabase functions deploy

# Deploy specific function
npx supabase functions deploy function-name
```

## 🚀 Deployment

### Development Deployment
- Automatically deploys on push to development branches
- Available at: `https://twisted-hearth-foundation-dev.web.app/`

### Production Deployment
- Deploys on push to `prod-main` branch
- Available at: `https://2025.partytillyou.rip/`

### Manual Deployment
```bash
# Build and deploy to Firebase
npm run build:prod
firebase deploy --only hosting
```

## 📊 Analytics & Monitoring

The application includes comprehensive analytics tracking:

- **User Sessions**: Track user engagement and behavior
- **Page Views**: Monitor content popularity and navigation patterns
- **Content Interactions**: Track photo views, reactions, and guestbook activity
- **Performance Metrics**: Monitor load times and error rates
- **Daily Aggregates**: Automated daily rollup of analytics data

Access analytics through the admin dashboard or use the provided SQL queries in `docs/ANALYTICS_RUNBOOK.md`.

## 🔐 Security

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Supabase Auth with email/password and OAuth
- **API Security**: Edge functions with proper validation
- **Content Moderation**: Built-in reporting and approval systems
- **Privacy Compliance**: No physical addresses exposed in client code

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **Database Schema**: Complete table definitions and relationships
- **Deployment Guides**: Step-by-step deployment procedures
- **Analytics Runbook**: Monitoring and troubleshooting guide
- **API Documentation**: Edge function specifications
- **Admin Guides**: Administrative tool usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use ESLint for code quality
- Write descriptive commit messages
- Test changes thoroughly
- Update documentation as needed

## 📝 License

This project is private and proprietary to The Ruths' Halloween Bash.

## 🆘 Support

For technical support or questions:
- Check the documentation in `docs/`
- Review the troubleshooting guides
- Contact the development team

## 🎯 Roadmap

### Completed Features (v3.5.0)
- ✅ Complete notification system
- ✅ Mobile UX overhaul
- ✅ RSVP enhancements
- ✅ Modern carousel system
- ✅ Release management system
- ✅ Analytics dashboard
- ✅ Network and dependency optimizations

### Future Features
- Real-time notifications with WebSockets
- Push notification support
- Advanced analytics and insights
- A/B testing framework
- Performance monitoring dashboard

---

**Version**: 3.5.0  
**Last Updated**: January 2025  
**Status**: Production Ready ✅