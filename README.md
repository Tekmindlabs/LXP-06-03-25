# Aivy LXP (Learning Experience Platform)

A modern learning experience platform built with Next.js 14+, tRPC, and TypeScript.

## Tech Stack

- **Frontend**: Next.js 14+, React 18, Tailwind CSS
- **Backend**: tRPC, Prisma, PostgreSQL
- **Authentication**: NextAuth.js v5
- **State Management**: React Query, Zustand
- **UI Components**: shadcn/ui, Radix UI
- **Testing**: Jest, React Testing Library, Cypress
- **Type Safety**: TypeScript, Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/aivy-lxp.git
   cd aivy-lxp
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. Set up the database:
   ```bash
   pnpm prisma generate
   pnpm prisma migrate dev
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
/src
├── app                      # Next.js App Router
│   ├── (auth)              # Authentication Routes
│   ├── (system-admin)      # System Admin Portal
│   ├── (campus-admin)      # Campus Admin Portal
│   ├── (coordinator)       # Coordinator Portal
│   ├── (teacher)           # Teacher Portal
│   ├── (student)           # Student Portal
│   └── api                 # API Routes
├── components              # React Components
├── server                  # Backend Logic
├── lib                     # Shared Utilities
├── types                   # TypeScript Types
└── styles                  # Global Styles
```

## Features

- **Multi-tenant Architecture**: Support for multiple institutions and campuses
- **Role-based Access Control**: Different portals for different user roles
- **Real-time Updates**: WebSocket integration for live updates
- **Analytics System**: Track user interactions and system performance
- **Feedback System**: Comprehensive feedback management
- **Professional Development**: Track teacher training and certifications

## User Preferences

The application now supports user preferences, allowing users to customize their experience. The preferences include:

- Theme selection (light/dark/system)
- Accessibility options
- Notification preferences
- Display preferences

### Accessing User Preferences

Users can access their preferences through:

1. The settings icon in the top-right corner of the application
2. The user dropdown menu > Settings
3. Directly navigating to `/settings/preferences`

### Settings Navigation

The settings section includes the following pages:

- Account Settings
- Preferences
- Notifications
- Security

### Technical Implementation

The user preferences functionality is implemented using:

- Prisma schema with a `UserPreferences` model
- React Context API for state management
- Server-side API endpoints for persistence
- Client-side components for the user interface
- Centralized default preferences and types in `src/server/api/constants.ts`

Default preferences are role-based, with different defaults for different user types (students, teachers, administrators, etc.). The preferences are stored in the user's profile data as JSON and synchronized across devices. When offline, preferences fall back to local storage.

## Development

### Commands

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm test`: Run tests
- `pnpm test:e2e`: Run end-to-end tests
- `pnpm lint`: Lint code
- `pnpm prisma:generate`: Generate Prisma client
- `pnpm prisma:migrate`: Run database migrations

### Code Style

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Conventional Commits for commit messages

## Testing

- Unit tests with Jest and React Testing Library
- End-to-end tests with Cypress
- API tests with tRPC test clients

## Deployment

The application is designed to be deployed on Vercel with the following considerations:

- PostgreSQL database on a managed service
- Redis for caching (optional)
- S3 or similar for file storage
- CDN for static assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Proprietry 

## Database Seeding

The application uses Prisma for database management and includes a seeding mechanism to populate the database with initial data. The seeding process follows this order:

1. Institutions - Basic information about educational institutions
2. Campuses - Physical locations associated with institutions
3. Users - System users including administrators for each institution
4. Academic Cycles - Academic periods (years, semesters, etc.) for each institution

### Seed Files

- `src/server/db/seed-data/institutions.ts` - Contains institution data
- `src/server/db/seed-data/campuses.ts` - Contains campus data linked to institutions
- `src/server/db/seed-data/users.ts` - Contains system users and test users
- `src/server/db/seed-data/academic-cycles.ts` - Contains academic cycle data for each institution

### Running Seeds

To seed the database:

```bash
npm run db:seed
```

### Important Notes

- The seeding order is critical because academic cycles require users as creators/updaters
- Each institution needs at least one administrator user before academic cycles can be created
- The seed process automatically creates admin users for each institution 

## Dashboard Routing System

The application implements a role-based dashboard routing system that directs users to their appropriate dashboards based on their user type:

- **System Admin**: `/admin/system`
- **Campus Admin**: `/admin/campus`
- **Campus Coordinator**: `/admin/coordinator`
- **Teacher**: `/teacher/dashboard`
- **Student**: `/student/dashboard`
- **Parent**: `/parent/dashboard`

### How It Works

1. When a user navigates to `/dashboard`, the dashboard layout component checks their user type.
2. Based on the user type, the layout performs a client-side navigation to the appropriate dashboard.
3. The Shell component provides a consistent navigation experience across all dashboard types.

### Implementation Details

- The dashboard redirection happens in `src/app/dashboard/layout.tsx`
- Role-specific dashboard content is implemented in each dashboard page
- The navigation sidebar adapts to show relevant links based on the user's role

## Layout System

The application uses a multi-layered layout system to provide consistent UI across different user roles:

### Admin Layout

- Located at `src/app/admin/layout.tsx`
- Provides a sidebar with role-specific navigation items for admin users
- Handles responsive behavior for mobile and desktop views
- Used for system admin, campus admin, and coordinator routes

### Shell Component

- Located at `src/components/layout/shell.tsx`
- Provides a consistent layout for non-admin routes
- Conditionally renders its sidebar based on the current route
- For admin routes, it only renders the main content without a sidebar to avoid duplicate sidebars

### AppShellWrapper

- Located at `src/components/layout/app-shell-wrapper.tsx`
- Manages authentication state and conditionally wraps content with the Shell component
- Used as a higher-order component to provide consistent layout across the application

## TRPC Router System

The application uses tRPC for type-safe API calls with the following structure:

- Root router (`src/server/api/root.ts`) combines all sub-routers
- Each domain has its own router file (e.g., `academic-cycle.router.ts`, `term.ts`)
- Services handle business logic and database operations
- Routers define endpoints and handle request validation

### Important Routers

- `academicCycle`: Manages academic cycles (years, semesters, etc.)
- `term`: Manages terms within academic cycles
- `auth`: Handles authentication and user sessions
- `user`: Manages user profiles and preferences

### Using Toast Notifications

The application uses a custom toast notification system:

- Import the `useToast` hook from `@/components/ui/feedback/toast`
- Use the `addToast` method to show notifications
- Specify `title`, `description`, and `variant` ('success', 'error', 'warning', 'default') 