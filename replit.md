# Replit.md

## Overview

This is a binary options trading signal bot application. It provides users with simulated CALL/PUT trading signals for various OTC currency pairs across different timeframes. The app features a React frontend with a sleek dark trading interface and an Express backend that generates randomized trading signals with confidence scores.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for smooth UI transitions and signal reveals
- **Build Tool**: Vite with hot module replacement

The frontend is a single-page application located in `/client` directory. It uses path aliases (`@/` for client src, `@shared/` for shared code) configured in both TypeScript and Vite.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL

The server is located in `/server` directory with:
- `index.ts`: Express app setup and middleware
- `routes.ts`: API route handlers
- `storage.ts`: Database abstraction layer
- `db.ts`: Database connection configuration

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `/shared/schema.ts`
- **Migrations**: Drizzle Kit with migrations in `/migrations`

Key data model:
- `signals` table: Stores generated trading signals with pair, timeframe, type (CALL/PUT), entry time, and optional result tracking

### Shared Code Pattern
The `/shared` directory contains code used by both frontend and backend:
- `schema.ts`: Database schema, Zod validation schemas, and TypeScript types
- `routes.ts`: API route definitions with input/output schemas

### Build System
- **Development**: Vite dev server with Express backend (tsx)
- **Production Build**: Custom build script (`script/build.ts`) using esbuild for server bundling and Vite for client
- **Output**: Built files go to `/dist` with client assets in `/dist/public`

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **SSL**: Enabled in production for secure database connections

### Key NPM Packages
- **UI Components**: Full shadcn/ui component set with Radix UI primitives
- **Data Fetching**: TanStack React Query for caching and server state
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers
- **Date Utilities**: date-fns for date formatting

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Set to "production" for production builds

### Replit-Specific Integrations
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer`: Development tooling (dev only)
- `@replit/vite-plugin-dev-banner`: Development banner (dev only)