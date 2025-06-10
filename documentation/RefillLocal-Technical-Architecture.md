# RefillLocal - Technical Architecture

This document outlines the technical architecture of the RefillLocal application, including the technology stack, project structure, data models, and key architectural decisions.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Query
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Serverless Functions**: Supabase Edge Functions (as needed)

### Third-Party Services
- **Email**: Resend
- **Analytics**: PostHog
- **Hosting**: Netlify
- **Maps**: (TBD - likely Google Maps or Mapbox)

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── layout/           # Layout components (header, footer, etc.)
│   └── ...               # Feature-specific components
├── pages/                # Page components
├── lib/                  # Shared utilities and services
│   ├── constants.ts      # Application constants
│   ├── router.tsx        # Route definitions
│   ├── services.ts       # API service functions
│   ├── supabase.ts       # Supabase client configuration
│   └── types.ts          # TypeScript type definitions
├── assets/               # Static assets (images, fonts, etc.)
├── hooks/                # Custom React hooks
├── App.tsx               # Root component
└── main.tsx              # Application entry point
```

## Data Models

### City
```typescript
interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  country: string;
  is_active: boolean;
  created_at: string;
  image_url?: string;
}
```

### Store
```typescript
interface Store {
  id: string;
  name: string;
  description: string;
  website_url?: string;
  phone?: string;
  email?: string;
  address: string;
  city_id: string;
  latitude: number;
  longitude: number;
  hours_of_operation: string;
  what_to_bring: string;
  products: string[];
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  image_url?: string;
  added_by_user_id?: string;
}
```

### WaitlistEntry
```typescript
interface WaitlistEntry {
  id: string;
  email: string;
  city: string;
  created_at: string;
  referred_by?: string;
}
```

### CityRequest
```typescript
interface CityRequest {
  id: string;
  city_name: string;
  state: string;
  country: string;
  votes: number;
  created_at: string;
}
```

## Architecture Decisions

### Database Schema
- Supabase PostgreSQL database with the following tables:
  - `cities` - Stores city information
  - `stores` - Stores refill/zero-waste store information
  - `waitlist` - Stores email signups for waitlist
  - `city_requests` - Stores requests for new cities
- Row-Level Security (RLS) policies for data access control
- Indexes on frequently queried columns for performance

### Authentication & Authorization
- Supabase Auth for user authentication
- Anonymous access for public features
- Role-based access control for admin functions
- JWT tokens for authenticated requests

### Frontend Architecture
- Component-based architecture with reusable UI components
- React Router for client-side routing
- React Query for server state management and caching
- Custom hooks for shared logic

### API Services
- Service functions for interacting with Supabase
- Organized by domain (city, store, waitlist, etc.)
- Error handling and logging

### Deployment Strategy
- Netlify for hosting the frontend
- Supabase for backend services
- Environment-specific configuration via environment variables
- CI/CD pipeline for automated deployments

## Security Considerations

- Environment variables for sensitive information
- Row-Level Security policies in Supabase
- CORS configuration
- Content Security Policy
- HTTPS enforcement
- Input validation and sanitization

## Performance Optimization

- Optimistic UI updates for better user experience
- React Query caching for reduced API calls
- Lazy loading of images and components
- Code splitting for faster initial load
- Tailwind CSS purging for smaller CSS bundles

## Monitoring & Analytics

- PostHog for user behavior analytics
- Error tracking and reporting
- Performance monitoring
- Feature usage tracking
