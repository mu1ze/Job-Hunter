# Environment Setup

To run this project locally, you need to configure the environment variables and ensure the backend services are reachable.

## 1. Prequisites

-   **Node.js**: v18 or higher.
-   **NPM/Yarn**: Package manager.
-   **Supabase Account**: For database and auth.

## 2. Environment Variables (`.env`)

Create a `.env` file in the root directory.

```properties
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# (Optional) Analytics / 3rd Party Keys if handled on frontend
# VITE_SOME_API_KEY=...
```

*Note: Most sensitive API keys (OpenAI, Adzuna, Perplexity) should be stored in **Supabase Edge Function Secrets**, not in the frontend `.env` file.*

## 3. Supabase Setup

### Database
Run the `schema.sql` (found in project root) in your Supabase SQL Editor to create the necessary tables and RLS policies.

### Edge Functions
The project relies on specific Edge Functions which must be deployed to your Supabase project:
1.  `search-jobs`
2.  `deep-job-search`
3.  `generate-document`
4.  `calculate-ats-score`

To deploy these (if you have the source):
```bash
supabase functions deploy search-jobs
supabase functions deploy deep-job-search
# ...etc
```

### Edge Function Secrets
You must set secrets in Supabase for the external services used by the Edge Functions:
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ADZUNA_APP_ID=...
supabase secrets set ADZUNA_APP_KEY=...
supabase secrets set PERPLEXITY_API_KEY=pplx-...
```

## 4. Running Locally

1.  **Clone & Install**:
    ```bash
    git clone <repo-url>
    cd job-hunter
    npm install
    ```

2.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

3.  **Build**:
    ```bash
    npm run build
    # Content usually output to /dist
    ```
