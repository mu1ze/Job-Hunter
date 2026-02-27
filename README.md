# Job Hunter

AI-powered job search and application tracker.

## 🚀 Quick Start

```bash
# 1. Clone & install
git clone https://github.com/yourusername/job-hunter.git
cd job-hunter
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Run locally
npm run dev
```

Access the app at `http://localhost:5173`.

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (dark theme)
- **State Management**: Zustand (persisted to localStorage)
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **UI Libraries**: Lucide React, dnd-kit, Recharts, React Hot Toast

## 📂 Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable components (Button, Input, Card, etc.)
│   └── layout/       # MainLayout, Sidebar, etc.
├── pages/            # Route components (Dashboard, Jobs, Tracker, etc.)
├── stores/           # Zustand stores (useUserStore, useJobsStore, etc.)
├── hooks/            # Custom React hooks
├── lib/              # Supabase client config
├── services/         # API wrappers
├── types/            # TypeScript interfaces
└── utils/            # Helper functions
```

## 🗄️ Database (Supabase)

### Tables
- `user_profiles` - Extended user info
- `job_preferences` - Search criteria & preferences
- `saved_jobs` - Tracked job applications with status (saved → applied → interviewing → offer)
- `resumes` - Uploaded resumes with parsed data
- `generated_documents` - AI-generated tailored resumes/cover letters
- `job_market_analytics` - Cached market data

All user tables have RLS enabled - users can only access their own data.

### Setup
1. Create a Supabase project at supabase.com
2. Run `schema.sql` in the Supabase SQL Editor
3. Deploy Edge Functions (see below)

## ⚡ Edge Functions

The app uses Supabase Edge Functions for AI and external API calls:

| Function | Purpose |
|----------|---------|
| `search-jobs` | Proxies job search to Adzuna API |
| `deep-job-search` | AI-powered job matching |
| `generate-document` | Generates tailored resumes/cover letters |
| `calculate-ats-score` | Analyzes resume against job |

### Deploy Functions
```bash
supabase functions deploy search-jobs
supabase functions deploy deep-job-search
supabase functions deploy generate-document
supabase functions deploy calculate-ats-score
```

### Set Secrets
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ADZUNA_APP_ID=...
supabase secrets set ADZUNA_APP_KEY=...
supabase secrets set PERPLEXITY_API_KEY=pplx-...
```

## 🔑 Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🎯 Key Features

1. **Application Tracker** - Kanban board (drag-and-drop) for managing job applications
2. **AI Deep Match** - Ranks jobs against your resume based on skills (50%), experience (30%), industry (20%)
3. **Job Search** - Integrated search with filters (location, remote, salary)
4. **Resume Manager** - Upload and parse resumes, set primary resume for matching
5. **Document Generator** - AI-generated tailored resumes and cover letters
6. **Analytics** - Visual insights into your job search progress

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
