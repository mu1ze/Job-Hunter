# JobHunter - Setup & Usage Guide

## Prerequisites

1. **Node.js 18+** - Required to run the frontend
2. **Supabase Project** - Cloud database and auth (already linked: `meyniasnutrgpnwvavrm`)
3. **API Keys** - Required for job search and AI features

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file (or update existing):

```env
VITE_SUPABASE_URL=https://meyniasnutrgpnwvavrm.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Supabase Setup

The database is already configured with migrations. You need to:

**Set API Secrets:**
```bash
# Set Edge Function secrets
supabase secrets set ADZUNA_APP_ID=your_adzuna_app_id
supabase secrets set ADZUNA_API_KEY=your_adzuna_api_key
supabase secrets set GROQ_API_KEY=your_groq_api_key
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

**Deploy Edge Functions:**
```bash
supabase functions deploy
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

## API Keys Required

| Service | Purpose | Where to get |
|---------|---------|--------------|
| **Adzuna** | Job search API | [adzuna.com](https://www.adzuna.com) |
| **Groq** | AI document generation | [groq.com](https://groq.com) |
| **Resend** | Email notifications | [resend.com](https://resend.com) |

## Features Overview

### Job Search
- Search jobs by title, keywords, location
- Filter by salary, remote, job type
- Save jobs to tracker
- Deep research on companies

### Application Tracker
- Kanban-style board (Saved → Applied → Interviewing → Offer)
- Track applications with dates
- Add recruiter contact info

### Resume Management
- Upload resumes (PDF, DOC, DOCX)
- AI parsing of skills, experience
- Generate tailored resumes/cover letters

### Job Alerts
- Create custom alerts
- Daily/weekly email notifications
- In-app notification center

### Analytics
- Application metrics
- Response rate, success rate
- Salary distribution
- Timeline of activities

## Database Schema

Tables created:
- `user_profiles` - User info + avatar
- `job_preferences` - Search defaults
- `saved_jobs` - Tracked jobs
- `resumes` - Uploaded resumes
- `generated_documents` - AI-generated docs
- `job_alerts` - Alert configs
- `notifications` - In-app notifications
- `career_items` - Career development
- `resume_analyses` - AI analysis history

## Troubleshooting

### Edge Functions Not Working
1. Check secrets are set: `supabase secrets list`
2. Redeploy functions: `supabase functions deploy`

### Storage Issues (Upload Errors)
- Buckets created: `resumes`, `user-content`
- Check storage policies in Supabase dashboard

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
npm run build
```

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **State**: Zustand + React Query
- **Backend**: Supabase (Auth, DB, Storage, Edge Functions)
- **AI**: Groq (Llama 3.3)
- **Job Data**: Adzuna API

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route pages
├── stores/        # Zustand state stores
├── lib/           # Utilities & configs
├── types/         # TypeScript definitions
└── utils/         # Helper functions

supabase/
├── functions/     # Edge functions
└── migrations/    # Database migrations
```

## License

MIT
