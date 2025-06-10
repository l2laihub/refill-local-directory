# RefillLocal - Technical Architecture

This document outlines the technical architecture for the RefillLocal platform, detailing the technology stack, system components, data models, and infrastructure considerations.

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Context API with hooks for simpler state needs, Redux for more complex state management
- **Routing**: React Router for client-side routing
- **UI Components**: Custom component library with design system
- **Form Handling**: React Hook Form for efficient form state management
- **Data Fetching**: React Query for server state management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend
- **API Layer**: Node.js with Express
- **Authentication**: JWT-based authentication with refresh tokens (via Supabase Auth)
- **Database**: Supabase (PostgreSQL) for relational data storage
- **Search**: Supabase full-text search capabilities
- **File Storage**: Supabase Storage for image and asset storage
- **Caching**: Supabase edge functions and caching
- **Email Service**: Resend for transactional emails and notifications

### DevOps
- **Hosting**: Netlify for frontend, Vercel for backend services
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Monitoring**: PostHog for error tracking, user analytics, and feature flags
- **Performance**: Lighthouse for performance monitoring
- **Security**: HTTPS, Content Security Policy, regular dependency audits

## System Architecture

### Component Diagram

```
┌────────────────────┐       ┌────────────────────┐
│                    │       │                    │
│   Client Browser   │◄─────►│   Frontend App     │
│                    │       │   (React + Vite)   │
└────────────────────┘       └─────────┬──────────┘
                                       │
                                       ▼
                             ┌────────────────────┐
                             │                    │
                             │   API Gateway      │
                             │   (Express)        │
                             │                    │
                             └─────────┬──────────┘
                                       │
                       ┌───────────────┼───────────────┐
                       │               │               │
                       ▼               ▼               ▼
             ┌────────────────┐ ┌────────────┐ ┌────────────────┐
             │                │ │            │ │                │
             │  Store Service │ │  User      │ │  Search        │
             │                │ │  Service   │ │  Service       │
             └───────┬────────┘ └─────┬──────┘ └────────┬───────┘
                     │                │                 │
                     └────────────────┼─────────────────┘
                                      │
                                      ▼
                             ┌────────────────────┐
                             │                    │
                             │  Supabase          │
                             │  (PostgreSQL + Storage) │
                             │                    │
                             └────────────────────┘
```

### Microservices

The backend is structured as a collection of microservices:

1. **Store Service**
   - Manages store listings
   - Handles CRUD operations for store data
   - Processes store verification and moderation

2. **User Service**
   - Manages user accounts and authentication
   - Handles user profiles and preferences
   - Processes waitlist signups and notifications

3. **Search Service**
   - Manages city and store search functionality
   - Handles search indexing and optimization
   - Processes filtering and sorting of results

4. **Contribution Service**
   - Manages community contributions
   - Handles the submission and moderation workflow
   - Processes attribution and notifications

5. **Notification Service**
   - Manages email communications
   - Handles transactional and marketing emails
   - Processes notification preferences

## Data Models

### Store
```typescript
interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  images: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    }
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    socialMedia: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    }
  };
  hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  categories: string[];
  products: {
    category: string;
    items: string[];
  }[];
  whatToBring: string[];
  reviews: {
    userId: string;
    rating: number;
    comment: string;
    date: Date;
  }[];
  averageRating: number;
  verified: boolean;
  featured: boolean;
  createdBy: string; // userId
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  avatar?: string;
  city?: string;
  accountType: 'user' | 'storeOwner' | 'admin';
  favoriteStores: string[]; // storeIds
  contributions: {
    storeId: string;
    contributionType: 'created' | 'edited' | 'reviewed';
    date: Date;
  }[];
  notifications: {
    enabled: boolean;
    cityUpdates: boolean;
    storeUpdates: boolean;
    marketing: boolean;
  };
  referralCode: string;
  referredBy?: string; // userId
  referrals: string[]; // userIds
  createdAt: Date;
  updatedAt: Date;
}
```

### City
```typescript
interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  slug: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  active: boolean;
  storeCount: number;
  featured: boolean;
  waitlistCount: number;
  launchDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Store API
- `GET /api/stores` - Get all stores (with pagination)
- `GET /api/stores/:id` - Get store by ID
- `GET /api/cities/:citySlug/stores` - Get stores by city
- `POST /api/stores` - Create new store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store
- `POST /api/stores/:id/review` - Add review to store

### User API
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile
- `GET /api/users/me/favorites` - Get user's favorite stores
- `POST /api/users/me/favorites/:storeId` - Add store to favorites
- `DELETE /api/users/me/favorites/:storeId` - Remove store from favorites

### Search API
- `GET /api/search/cities` - Search cities
- `GET /api/search/stores` - Search stores
- `GET /api/cities` - Get all active cities

### Waitlist API
- `POST /api/waitlist` - Join waitlist
- `POST /api/cities/request` - Request a city

## Security Considerations

1. **Authentication and Authorization**
   - JWT-based authentication with short-lived access tokens
   - Role-based access control for admin functions
   - Protected routes for authenticated users

2. **Data Protection**
   - HTTPS for all communications
   - Input validation and sanitization
   - Protection against common web vulnerabilities (XSS, CSRF)

3. **API Security**
   - Rate limiting to prevent abuse
   - CORS configuration
   - API keys for third-party integrations

## Scalability Considerations

1. **Database Scaling**
   - Leveraging Supabase's PostgreSQL scaling capabilities
   - Read replicas for improved read performance
   - Optimized indexing strategy for common queries
   - Connection pooling for efficient resource utilization

2. **Caching Strategy**
   - Supabase edge functions and caching
   - CDN for static assets and images
   - Browser caching with appropriate cache headers
   - Leveraging Supabase's built-in caching mechanisms

3. **Infrastructure Scaling**
   - Utilizing Supabase's managed infrastructure
   - Vercel serverless functions for API endpoints
   - Auto-scaling based on traffic patterns
   - Geo-distribution for reduced latency

## Monitoring and Analytics

1. **Performance Monitoring**
   - Server-side performance metrics
   - Client-side performance tracking
   - Real-time error monitoring with PostHog

2. **User Analytics**
   - Conversion funnel tracking through PostHog
   - Feature usage analytics with session recordings
   - A/B testing and feature flag experiments via PostHog

3. **Business Metrics**
   - Store listing growth tracking
   - User growth and engagement metrics
   - City coverage and expansion metrics
   - Cohort analysis via PostHog

## Development Workflow

1. **Version Control**
   - Git-based workflow with feature branches
   - Pull request reviews
   - Semantic versioning

2. **Testing Strategy**
   - Unit tests for business logic
   - Integration tests for API endpoints
   - End-to-end tests for critical user flows
   - Accessibility testing

3. **Deployment Strategy**
   - Staging environment for QA
   - Canary deployments for risk mitigation
   - Automated rollbacks for failed deployments
