# Environment Setup

To run this project locally, you need to configure the environment variables and ensure the backend services are reachable.

## 1. Prerequisites

-   **Node.js**: v18 or higher
-   **NPM/Yarn**: Package manager
-   **Supabase Account**: For database and auth
-   **Supabase CLI**: For deploying Edge Functions

## 2. Environment Variables (`.env`)

Create a `.env` file in the root directory.

```properties
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# (Optional) Analytics / 3rd Party Keys if handled on frontend
# VITE_SOME_API_KEY=...
```

**Note**: Most sensitive API keys (OpenAI, Adzuna, Perplexity) should be stored in **Supabase Edge Function Secrets**, not in the frontend `.env` file.

### Getting Supabase Credentials

1.  Go to [supabase.com](https://supabase.com) and create a project
2.  Go to **Settings** → **API**
3.  Copy **Project URL** → `VITE_SUPABASE_URL`
4.  Copy **Project API keys** → `VITE_SUPABASE_ANON_KEY`

## 3. Supabase Setup

### Database

1.  Go to your Supabase project's **SQL Editor**
2.  Run `schema.sql` (found in project root) to create tables and RLS policies

### Tables Created

-   `user_profiles`
-   `job_preferences`
-   `saved_jobs`
-   `resumes`
-   `generated_documents`
-   `job_market_analytics`
-   `career_items`
-   `resume_analyses`

### Storage

1.  Go to **Storage** in Supabase dashboard
2.  Create a new bucket named `resumes`
3.  Set policies to allow authenticated users to upload/download

### Edge Functions

The project relies on specific Edge Functions which must be deployed to your Supabase project:

| Function | Purpose |
|----------|---------|
| `search-jobs` | Proxies job search to Adzuna API |
| `deep-job-search` | AI-powered job matching |
| `generate-document` | Generates tailored resumes/cover letters |
| `calculate-ats-score` | Analyzes resume against job |
| `research-company` | Company research via Perplexity |

### Deploying Edge Functions

```bash
# Install Supabase CLI if not already
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy search-jobs
supabase functions deploy deep-job-search
supabase functions deploy generate-document
supabase functions deploy calculate-ats-score
supabase functions deploy research-company
```

### Edge Function Secrets

You must set secrets in Supabase for the external services used by the Edge Functions:

```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ADZUNA_APP_ID=...
supabase secrets set ADZUNA_APP_KEY=...
supabase secrets set PERPLEXITY_API_KEY=pplx-...
```

To set secrets in the dashboard:
1.  Go to **Settings** → **Edge Functions**
2.  Add each secret key-value pair

## 4. Running Locally

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd job-hunter

# Install dependencies
npm install
```

### Start Development Server

```bash
npm run dev
```

Access the app at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output is typically in the `/dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 5. Development Workflow

### Making Changes

1.  Create a new branch: `git checkout -b feature/your-feature`
2.  Make changes in `src/`
3.  Test locally with `npm run dev`
4.  Build to check for errors: `npm run build`
5.  Commit and push

### Updating Database Schema

If you need to modify the database:

1.  Make changes in SQL Editor
2.  Or edit `schema.sql` and run it
3.  RLS policies need to be updated separately

### Updating Edge Functions

1.  Find function code in `/supabase/functions/`
2.  Edit the function
3.  Deploy: `supabase functions deploy function-name`

## 6. Troubleshooting

### Common Issues

**Build fails with module not found**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Auth not working**
-   Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
-   Verify Supabase project is active

**Edge Functions returning errors**
-   Check function secrets are set in Supabase dashboard
-   Check function logs in Supabase dashboard

**Jobs not loading**
-   Verify Adzuna API keys are set as secrets
-   Check API quota limits

## 7. Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## 8. Code Style

-   Uses ESLint and Prettier
-   TypeScript strict mode
-   Follows existing code patterns in `src/`
-   Component files: PascalCase (e.g., `JobSearch.tsx`)
-   Utility files: camelCase (e.g., `adzuna.ts`)
