# Job Hunter

Job Hunter is a comprehensive job application tracking and optimization platform designed to streamline your job search process. It combines powerful tracking tools with AI-driven insights to help you find relevant roles, manage your applications, and generate tailored documents.

## 🚀 Key Features

*   **Application Tracker**: Visualize and manage your job applications through different stages (Saved, Applied, Interviewing, Offer, etc.) using a drag-and-drop interface.
*   **AI Deep Match**: A sophisticated search and ranking system that leverages your resume to pair you with roles where you have the highest probability of success.
*   **Resume Manager**: Upload, store, and parse your resumes to extract skills and experience for better job matching.
*   **Document Generator**: Create AI-powered cover letters and tailored resumes based on specific job descriptions and your profile.
*   **Job Search**: Integrated job search functionality with advanced filtering and Deep Match capabilities.
*   **Analytics**: Gain insights into the job market and your application performance with visual analytics.
*   **Alerts Manager**: Set up and manage job alerts to stay updated on new opportunities.

## 🛠 Tech Stack

*   **Frontend**: React (Vite), TypeScript
*   **Styling**: Tailwind CSS
*   **State Management**: Zustand
*   **Routing**: React Router
*   **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime)
*   **UI Components**: Lucide React, dnd-kit, Recharts, React Hot Toast

## 🏁 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/job-hunter.git
    cd job-hunter
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Environment Setup:
    Create a `.env` file in the root directory based on `.env.example` and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

*   `/src/components`: Reusable UI components and layout wrappers.
*   `/src/pages`: Application views (Dashboard, JobSearch, Tracker, etc.).
*   `/src/lib`: Configuration and helper functions (Supabase client).
*   `/src/stores`: Zustand state stores (User, Job, etc.).
*   `/src/hooks`: Custom React hooks.
*   `/supabase`: Database migrations and types.

## 🗄️ Database Schema

The project uses Supabase (PostgreSQL) with the following core tables:

*   `user_profiles`: Extended user information.
*   `job_preferences`: User search criteria and preferences.
*   `saved_jobs`: tracked job applications with status and details.
*   `resumes`: Parsed resume data.
*   `generated_documents`: tailored cover letters and resumes.
*   `job_market_analytics`: Cached market data for analytics.

## 🧩 Deep Match

Deep Match is our proprietary AI matching engine. It analyzes your primary resume to extract core skills and career trajectory, then evaluates job listings based on:
*   **Skill Alignment (50%)**
*   **Experience Relevance (30%)**
*   **Industry Context (20%)**

See `DeepMatch.md` for more details.

## 📄 License

This project is licensed under the MIT License.
