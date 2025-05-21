# LeanSight Assessment Platform

This is a Next.js application for managing and conducting assessments based on configurable sectors, dimensions, and maturity descriptors.

## Project Overview

LeanSight aims to provide a flexible platform for:
- Defining assessment structures (sectors, dimensions, maturity levels).
- Creating and managing companies, departments, and users.
- Conducting assessments and tracking their progress.
- Analyzing assessment results through a dedicated dashboard.

## Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui, Material-UI (primarily for analytics dashboard)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Data Validation**: Zod

## Getting Started

### Prerequisites

- Node.js (version >= 18.x recommended)
- npm or yarn
- PostgreSQL database instance

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd leanSight
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up environment variables:**
    Copy the `.env.example` file to `.env` and fill in the required environment variables, especially `DATABASE_URL` and `NEXTAUTH_SECRET`.
    ```bash
    cp .env.example .env
    ```

4.  **Set up the database:**
    Ensure your PostgreSQL server is running and the database specified in `DATABASE_URL` exists.
    Run Prisma migrations to set up the database schema:
    ```bash
    npx prisma migrate dev
    ```
    (Optional) Seed the database with initial data:
    ```bash
    npx prisma db seed
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    The application should now be running on [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev` / `yarn dev`: Starts the development server.
- `npm run build` / `yarn build`: Creates a production build of the application.
- `npm run start` / `yarn start`: Starts the production server (requires a build first).
- `npm run lint` / `yarn lint`: Lints the codebase.
- `npx prisma migrate dev`: Applies database migrations during development.
- `npx prisma studio`: Opens Prisma Studio to view and manage database data.
- `npx prisma db seed`: Seeds the database (requires a seed script configured in `package.json` and `prisma/seed.ts`).

## Project Structure (Key Directories)

- `app/`: Contains the Next.js App Router pages and API routes.
  - `(admin)/`: Admin-specific pages.
  - `api/`: API route handlers.
  - `components/`: Reusable UI components.
  - `lib/`: Utility functions, Prisma client instance, auth configuration.
- `prisma/`: Prisma schema (`schema.prisma`), migrations, and seed script.
- `public/`: Static assets.

## Further Development

- **Sector & Descriptor Management**: Implement UI for creating, updating, and deleting sectors and their associated maturity level descriptors.
- **Assessment Workflow**: Develop the full workflow for users to take assessments.
- **Analytics Enhancements**: Continue to refine and expand the analytics dashboard.

## Contributing

[Details on how to contribute to the project, if applicable.] 