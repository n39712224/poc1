# MarketPlace Application

## Overview

This is a full-stack marketplace application built with a modern tech stack. It allows users to buy and sell items through a web interface with real-time messaging capabilities. The application features user authentication through Replit Auth, listing management, search and filtering, and a messaging system for buyer-seller communication.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom component library (shadcn/ui)
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **Theme Support**: Dark/light mode with context-based theme provider

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple

### Development Setup
- **Development Server**: Concurrent client (Vite) and server (tsx) processes
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend
- **Error Handling**: Runtime error overlay for development

## Key Components

### Authentication System
- Uses Replit Auth for OAuth-based authentication
- Session storage in PostgreSQL sessions table
- User profile management with firstName, lastName, email, profileImageUrl
- Protected routes requiring authentication

### Database Schema
- **Users**: Core user information and profiles
- **Listings**: Product listings with images, pricing, categories, conditions
- **Conversations**: Chat sessions between buyers and sellers
- **Messages**: Individual messages within conversations
- **Offers**: Price negotiation system (schema defined, implementation pending)
- **Sessions**: Authentication session storage

### Listing Management
- Create, read, update, delete operations for listings
- Image upload support (multiple images per listing)
- Category-based organization (electronics, fashion, home, books, sports, art)
- Condition tracking (new, like-new, good, fair)
- Featured listing capability
- Search and filtering by category, price range, condition, keywords

### Messaging System
- Real-time conversation management between buyers and sellers
- Message threading by listing and participants
- Conversation history and participant tracking

### UI Components
- Comprehensive component library based on Radix UI primitives
- Responsive design with mobile-first approach
- Accessible components with proper ARIA attributes
- Consistent styling with CSS variables and Tailwind

## Data Flow

### User Registration/Authentication
1. User clicks "Sign In" → redirects to `/api/login`
2. Replit Auth handles OAuth flow
3. User data stored/updated in users table
4. Session created in sessions table
5. User redirected to main application

### Listing Creation
1. User fills out listing form with validation
2. Frontend sends POST request to `/api/listings`
3. Server validates data using Zod schemas
4. Listing stored in database with seller reference
5. Client redirected to listing detail or updated listing view

### Search and Filtering
1. User applies filters in UI (category, price, condition, search terms)
2. Frontend constructs query parameters
3. Server applies filters using Drizzle ORM queries
4. Filtered results returned and displayed

### Messaging Flow
1. Buyer clicks "Message Seller" on listing
2. System creates/finds conversation between buyer and seller for that listing
3. Messages stored with conversation reference
4. Real-time updates through periodic polling

## External Dependencies

### Core Framework Dependencies
- **React 18**: Component framework with hooks
- **Express.js**: Backend web framework
- **Drizzle ORM**: Type-safe database operations
- **Zod**: Runtime schema validation
- **TanStack Query**: Server state management

### UI/UX Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **React Hook Form**: Form state management
- **Wouter**: Lightweight routing

### Database and Auth
- **@neondatabase/serverless**: PostgreSQL database driver
- **connect-pg-simple**: PostgreSQL session store
- **passport**: Authentication middleware
- **openid-client**: OAuth/OIDC implementation

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Static typing
- **ESBuild**: Fast JavaScript bundler
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- Uses Vite dev server for client-side development
- Express server runs in development mode with tsx
- Database migrations handled through Drizzle Kit
- Environment variables required: `DATABASE_URL`, `SESSION_SECRET`, `REPL_ID`

### Production Build
1. Frontend built with `vite build` to `dist/public`
2. Backend bundled with `esbuild` to `dist/index.js`
3. Single Node.js process serves both static files and API
4. Production database must be provisioned
5. Environment variables must be configured for production

### Database Management
- Schema defined in `shared/schema.ts`
- Migrations output to `./migrations` directory
- Use `npm run db:push` to apply schema changes
- Sessions table automatically managed by connect-pg-simple

## Changelog

- July 02, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.