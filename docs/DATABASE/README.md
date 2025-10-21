# Database Documentation - Twisted Hearth Foundation

This directory contains comprehensive documentation for the Supabase database schema, edge functions, and configuration used in the Twisted Hearth Foundation Halloween party management system.

## 📁 Documentation Structure

- **[Database Schema](./DATABASE_SCHEMA.md)** - Complete table definitions, relationships, and constraints
- **[Edge Functions](./EDGE_FUNCTIONS.md)** - Supabase Edge Functions documentation and API endpoints
- **[Environment Variables](./ENVIRONMENT_VARIABLES.md)** - Configuration variables and secrets management
- **[Database Functions](./DATABASE_FUNCTIONS.md)** - PostgreSQL functions, triggers, and stored procedures
- **[Security & RLS](./SECURITY_RLS.md)** - Row Level Security policies and access controls

## 🎯 Quick Reference

### Project Information
- **Project ID**: `dgdeiybuxlqbdfofzxpy`
- **Environment**: Production
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth with RLS

### Core Systems
1. **User Management** - Profiles, roles, and authentication
2. **RSVP System** - Event registration and guest management
3. **Photo Gallery** - Image uploads, approvals, and reactions
4. **Guestbook** - Social interactions and messaging
5. **Scavenger Hunt** - Interactive game system
6. **Tournament System** - Competition management
7. **Email System** - Campaigns and notifications
8. **Analytics** - User tracking and metrics
9. **Content Management** - Vignettes and stories
10. **Support System** - Issue tracking and reporting

### Key Features
- ✅ Row Level Security (RLS) on all tables
- ✅ Admin role system with secure functions
- ✅ Real-time subscriptions for live updates
- ✅ Comprehensive analytics tracking
- ✅ Email campaign management
- ✅ File storage with Supabase Storage
- ✅ Calendar invite generation
- ✅ Multi-tenant data isolation

## 🔧 Maintenance

This documentation is automatically updated when database migrations are applied. For manual updates, ensure all schema changes are reflected in the appropriate documentation files.

## 📞 Support

For database-related questions or issues, refer to:
- Admin Dashboard: `/admin`
- Support System: Built-in support reporting
- Technical Contact: fso@data-warrior.com