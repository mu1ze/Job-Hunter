# Workflows & Diagrams

This document visualizes the core business logic and user interaction flows within Job Hunter.

## 1. AI Document Generation Workflow

This flow describes how tailored resumes and cover letters are created.

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (DocumentGenerator)
    participant E as Edge Function (generate-document)
    participant AI as OpenAI (GPT-4)
    participant DB as Database

    U->>F: Select Job & Source Resume
    F->>E: POST /functions/v1/generate-document
    E->>AI: Send Prompt (Resume Data + Job Details)
    AI-->>E: Return Tailored Content
    E->>E: Calculate ATS Score & Keywords
    E->>DB: Save to generated_documents
    DB-->>E: Confirm Saved
    E-->>F: Return Document Data
    F->>U: Display Preview in Modal
```

## 2. Deep Match Search Flow

How the system identifies the best jobs for a user's unique profile.

```mermaid
graph TD
    A[User triggers Deep Match] --> B[Get User's Primary Resume]
    B --> C[Get User's Job Preferences]
    C --> D[Generate Multiple Search Queries via LLM]
    D --> E[Parallel Adzuna API Calls]
    E --> F[De-duplicate Search Results]
    F --> G[Edge Function: AI Scoring]
    G --> H[Rank by Skill/Exp/Industry Alignment]
    H --> I[Display Top Matches with Reasoning]
```

## 3. Resume Parsing & Enrichment

The process of turning a raw PDF into structured, searchable data.

```mermaid
flowchart LR
    A[PDF Upload] --> B[Supabase Storage]
    B --> C[Edge Function: parse-resume]
    C --> D[OCR / Text Extraction]
    C --> E[LLM Section Identification]
    E --> F[Experience]
    E --> G[Education]
    E --> H[Skills]
    F & G & H --> I[Save to resumes Table]
```

## 4. Mobile Interaction: Bottom Sheet Modal

We use a "Bottom Sheet" pattern for document previews on mobile to maximize reachability and avoid OS navigation conflicts.

### Key Logic
1.  **Top Sticky Actions**: Primary buttons (Download, Copy, Remix) are moved to the top of the modal on mobile.
    -   *Why?* The mobile app's bottom navigation bar and OS gesture indicators often obstruct bottom-fixed elements.
2.  **Body Scroll Lock**: When active, the background document scroll is disabled (`overflow: hidden`).
3.  **Dynamic Viewport**: Height set to `92dvh` with a `mb-20` margin to sit perfectly above the navigation bar.

### User Interaction Workflow (Mobile)
```mermaid
stateDiagram-v2
    [*] --> Idle: Dashboard/Job Details
    Idle --> DocumentModal: Tap Document Card
    state DocumentModal {
        [*] --> Initializing: Load Preview
        Initializing --> ViewContent: Scroll Document
        ViewContent --> ActionTriggered: Tap Download/Copy (Top Bar)
        ActionTriggered --> ViewContent: Success Toast
        ViewContent --> [*]: Tap Cancel/Close
    }
    DocumentModal --> Idle: Modal Hidden
```

## 5. PDF Export Optimization

To ensure professional quality, the PDF export uses a customized print CSS engine.

| Attribute | Optimization | Benefit |
|-----------|--------------|---------|
| **Margins** | Reduced to 0.3in - 0.4in | Fits more content on a single page |
| **Paging** | `@page { size: letter; }` | Standardized North American format |
| **Typography** | Font Clamping & Inter/Crimson Fonts | Maintains readability across sizes |
| **UI Striping** | `.no-print { display: none; }` | Removes digital buttons from physical document |
