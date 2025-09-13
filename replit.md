# Alumni Connect Platform

## Overview

This is a comprehensive alumni networking platform built with React, Express.js, and PostgreSQL. The application connects current students with alumni, providing features for mentorship, skill assessment, placement tracking, interview preparation, and networking. The platform serves as a bridge between academic life and professional careers, helping students make informed decisions about their future while leveraging the experience of successful alumni.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Session-based authentication with bcrypt for password hashing
- **API Design**: RESTful API with role-based access control
- **Middleware**: Custom authentication and logging middleware

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Management**: Code-first approach with TypeScript schema definitions
- **Database Provider**: Neon Database serverless PostgreSQL
- **Migration**: Drizzle Kit for schema migrations

### Key Database Entities
- **Users**: Students, alumni, and staff with role-based permissions
- **Posts**: Social feed for alumni sharing experiences
- **Assessments**: MCQ-based skill assessments with scoring
- **Interview Guides**: Company-specific interview preparation content
- **Events**: Alumni events and networking opportunities
- **Placements**: Job placement tracking and statistics
- **Mentorships**: Mentor-mentee relationship management

### Authentication & Authorization
- **Session-based Authentication**: Secure session management with HTTP-only cookies
- **Role-based Access Control**: Three user roles (student, alumni, staff) with different permissions
- **Protected Routes**: Client-side route protection with authentication guards
- **Password Security**: Bcrypt hashing with salt rounds

### Development Architecture
- **Monorepo Structure**: Shared schema and types between client and server
- **Development Server**: Vite dev server with Express API proxy
- **Hot Module Replacement**: Real-time updates during development
- **TypeScript Configuration**: Shared TypeScript config with path mapping

### Component Architecture
- **Design System**: Consistent UI components using Radix UI and shadcn/ui
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA-compliant components from Radix UI
- **Reusable Components**: Modular component structure with proper separation of concerns

## External Dependencies

### Core Backend Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon Database
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework
- **express-session**: Session middleware for authentication
- **bcryptjs**: Password hashing and verification
- **connect-pg-simple**: PostgreSQL session store

### Core Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation and schema validation

### UI and Styling Dependencies
- **@radix-ui/***: Unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Conditional CSS class utility
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **drizzle-kit**: Database schema management and migrations
- **esbuild**: Fast JavaScript bundler for production builds

### Third-party Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development and deployment platform