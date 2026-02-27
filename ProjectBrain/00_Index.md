# Job Hunter Project Documentation

This documentation details the structure, logic, and environment of the Job Hunter project. Use this guide to understand the codebase and rapidly recreate or extend the project.

## 📚 Documentation Index

1.  [**Architecture Overview**](./01_Architecture.md)
    -   High-level tech stack (Frontend & Backend).
    -   State management strategy (Zustand).
    -   Styling (Tailwind CSS).

2.  [**Database Schema**](./02_Database_Schema.md)
    -   Supabase PostgreSQL tables.
    -   Row Level Security (RLS) policies.
    -   Relationships between users, jobs, resumes, and documents.

3.  [**Frontend Structure**](./03_Frontend_Structure.md)
    -   Page breakdown and routing.
    -   Component hierarchy.
    -   Key UI libraries (Lucide, dnd-kit, Recharts).

4.  [**Core Features & Logic**](./04_Core_Features_Logic.md)
    -   **Deep Match Algorithm**: How jobs are ranked against resumes.
    -   **Document Generator**: AI-powered resume and cover letter creation.
    -   **Job Search**: Integration with Adzuna and custom search logic.
    -   **Application Tracker**: Kanban-style workflow.

5.  [**Environment Setup**](./05_Environment_Setup.md)
    -   Prerequisites.
    -   Environment variables (`.env`).
    -   Supabase configuration and Edge Functions.

---

## 🚀 Quick Start Summary

The project is a **React (Vite) Single Page Application** hosted on Netlify (implied) or similar, communicating with a **Supabase** backend for authentication, database, and Edge Functions (for AI logic).

### Key Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 📊 Current Implementation Overview

### Authentication Flow
- Uses Supabase Auth with email/password and OTP verification
- Session persisted via Zustand with localStorage
- Auth state listener in App.tsx maintains sync between tabs
- Protected routes redirect unauthenticated users to `/auth`
- Onboarding required after first login to set up profile and preferences

### State Management
- **Zustand** with `persist` middleware for localStorage persistence
- Three main stores:
  - `useUserStore` - User profile, preferences, authentication state
  - `useJobsStore` - Saved jobs, search results
  - `useResumeStore` - Uploaded resumes, parsed data, primary resume selection
  - `useCareerStore` - Career items, resume analyses

### API Integration
- **Adzuna API** - Job search via Edge Function proxy
- **Perplexity API** - Company research via Edge Function
- **OpenAI** - Document generation and Deep Match via Edge Functions

### Key Pages
1.  **Dashboard** - Overview with stats, recent activity, recommended jobs
2.  **Job Search** - Search interface with filters, Deep Match toggle
3.  **Application Tracker** - Kanban board with drag-and-drop (dnd-kit)
4.  **Resume Manager** - Upload, parse, and manage resumes
5.  **Document Generator** - AI-generated tailored resumes/cover letters
6.  **Analytics** - Charts showing application metrics (Recharts)
7.  **Alerts Manager** - Configure job search alerts
8.  **Profile** - User settings and preferences
