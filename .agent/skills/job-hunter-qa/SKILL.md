---
name: job-hunter-qa
description: >
  This skill should be used when the user asks to "test Job Hunter", "find bugs",
  "run QA", "check for security issues", "audit performance", "verify accessibility",
  "review code quality", or "test a new feature" within the Job Hunter project.
  It provides structured checklists, automated checks, and deep-dive procedures
  for bugs, security vulnerabilities, performance bottlenecks, and accessibility
  compliance specific to the Job Hunter codebase.
---

# Job Hunter Quality Assurance Skill

## Overview

This skill provides a comprehensive, project-specific quality assurance framework for the **Job Hunter** application — a React/Vite SPA backed by Supabase (PostgreSQL, Auth, Edge Functions). It covers five domains: **Bugs**, **Security**, **Performance**, **Accessibility**, and **Code Quality**. Each domain maps directly to the project's architecture, stores, services, and components.

---

## 1. Bug Detection Playbook

### 1.1 State Management Bugs (Zustand Stores)

The app uses three persisted Zustand stores. Common bugs arise from stale state, race conditions, and localStorage desync.

#### Checks

| Check | What to Look For | File(s) |
|-------|-----------------|---------|
| **Stale auth state** | `isAuthenticated` is `true` but Supabase session is expired. Reproduce by waiting 1h+ without refresh. | `src/stores/index.ts` (L24-102) |
| **Optimistic rollback failure** | `addSavedJob` adds to store but DB insert fails → job stays in UI without DB backing | `src/stores/index.ts` (L128-129) |
| **Primary resume desync** | `setPrimaryResume` sets `is_primary` in local state but may fail the DB update → Deep Match uses wrong resume | `src/stores/index.ts` (L179-185) |
| **localStorage bloat** | `job-hunter-jobs` store persists ALL search results, growing without bound | `src/stores/index.ts` (L147) |
| **Career store orphans** | Deleting a resume doesn't cascade-delete `resume_analyses` linked to it | `src/stores/career.ts` |

#### Automated Check

```bash
# Detect localStorage keys and sizes in browser console
Object.keys(localStorage).filter(k => k.startsWith('job-hunter')).forEach(k => {
  console.log(`${k}: ${(localStorage[k].length / 1024).toFixed(1)} KB`)
})
```

### 1.2 Edge Function Error Handling

| Check | What to Look For | File(s) |
|-------|-----------------|---------|
| **Silent failures** | `data?.error` check exists but error message may be swallowed if `data` is null | `src/services/adzuna.ts` (L24-27) |
| **Network timeout** | No explicit timeout set on `supabase.functions.invoke()` — hangs forever on slow connections | `src/services/adzuna.ts`, `perplexity.ts` |
| **Token refresh race** | `deepSearchJobs` checks session but doesn't handle mid-request token refresh | `src/services/adzuna.ts` (L87-90) |
| **Undefined mapping** | `job.company?.display_name` fallback is `"Unknown Company"` — may need explicit handling for `null` company objects | `src/services/adzuna.ts` (L39) |

### 1.3 Component Rendering Bugs

| Check | What to Look For | File(s) |
|-------|-----------------|---------|
| **Modal scroll lock leak** | If `DocumentPreviewModal` unmounts without cleanup, `body.style.overflow` stays `hidden` | `src/components/DocumentPreviewModal.tsx` |
| **Cover letter blank** | Content renders as empty if all styles are CSS-class-based (must use inline styles) | `src/components/CoverLetterPreview.tsx` |
| **Resume markdown artifacts** | AI-generated `**bold**` markers not stripped → rendered as literal asterisks | `src/components/GeneratedResumePreview.tsx` |
| **Drag-drop desync** | Moving a card in Kanban updates local state but DB update fails → card jumps back | `src/pages/ApplicationTracker.tsx` |
| **Infinite re-render** | `useEffect` with object dependency (e.g., `preferences`) → triggers on every render | All pages with `fetchUserData` |

### 1.4 PDF Export Bugs

| Check | What to Look For | File(s) |
|-------|-----------------|---------|
| **Multi-page overflow** | Content exceeds single page if top margin > 0.3in or font-size > 10pt | `GeneratedResumePreview.tsx`, `CoverLetterPreview.tsx` |
| **Popup blocked** | `window.open('', '_blank')` may return `null` in Safari → needs fallback | Both preview components |
| **Print headers** | Browser adds URL/date headers → wastes ~0.5in → must instruct user to disable | N/A (user guidance) |

---

## 2. Security Audit Procedures

### 2.1 Authentication & Authorization

| Risk | Description | Severity | Check Procedure |
|------|------------|----------|----------------|
| **Expired JWT reuse** | Supabase JWT may expire while user is on the page. Actions fail silently. | HIGH | Set Supabase session timeout to 1h, perform action at 61min, verify error handling. |
| **Missing auth on Edge Functions** | Edge functions should verify JWT from `Authorization` header. Verify each function checks `req.headers.get('Authorization')`. | CRITICAL | `grep -r "Authorization" supabase/functions/` |
| **localStorage token theft** | `job-hunter-user` stores `isAuthenticated` flag. If manually set to `true`, does the app grant access? | MEDIUM | Set `localStorage['job-hunter-user'] = '{"isAuthenticated":true}'` → refresh → verify redirect to `/auth` |
| **RLS bypass** | All user tables must have RLS enabled. A missing policy means any authenticated user can read all data. | CRITICAL | Run SQL: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';` |

### 2.2 Input Sanitization

| Vector | Where | Mitigation |
|--------|-------|-----------|
| **XSS via job description** | `adzuna.ts` response mapping strips HTML tags via `.replace(/<\/?[^>]+(>|$)/g, "")` | Verify regex handles edge cases: `<img onerror=alert(1)>`, nested tags |
| **XSS via notes field** | `JobDetails.tsx` notes textarea → saved to DB → rendered back | Ensure `dangerouslySetInnerHTML` is NOT used. Use text rendering only. |
| **SQL Injection via search** | Search filters passed to Edge Function → forwarded to Adzuna API | Verify Edge Function does NOT interpolate user input into SQL strings |
| **SSRF via company research** | `research-company` Edge Function takes `companyName` as input | Verify the function doesn't use `companyName` to construct URLs for fetch calls |

#### Automated Security Scan

```bash
# Check for dangerouslySetInnerHTML usage
grep -rn "dangerouslySetInnerHTML" src/ && echo "⚠️ FOUND" || echo "✅ Safe"

# Check for eval() usage
grep -rn "eval(" src/ && echo "⚠️ FOUND" || echo "✅ Safe"

# Check for exposed API keys in source
grep -rn "sk-\|pplx-\|ADZUNA_APP_KEY" src/ && echo "⚠️ KEYS EXPOSED" || echo "✅ Safe"

# Verify no secrets in production bundle
npm run build 2>/dev/null && grep -rn "sk-\|pplx-\|ADZUNA_APP_KEY" dist/ && echo "⚠️ SECRETS IN BUNDLE" || echo "✅ Bundle clean"
```

### 2.3 API Key Management

| Key | Storage Location | Exposure Risk |
|-----|-----------------|---------------|
| `VITE_SUPABASE_URL` | Frontend `.env` | LOW — public by design |
| `VITE_SUPABASE_ANON_KEY` | Frontend `.env` | LOW — anon key, RLS protects data |
| `OPENAI_API_KEY` | Supabase Edge Function Secrets | NONE if properly configured |
| `ADZUNA_APP_ID/KEY` | Supabase Edge Function Secrets | NONE if properly configured |
| `PERPLEXITY_API_KEY` | Supabase Edge Function Secrets | NONE if properly configured |

**Risk**: If any `OPENAI_API_KEY`, `ADZUNA_APP_KEY`, or `PERPLEXITY_API_KEY` appears in the frontend `.env` file prefixed with `VITE_`, it will be embedded in the client bundle and publicly exposed.

```bash
# CRITICAL: Verify no sensitive keys are prefixed with VITE_
grep -E "^VITE_.*API_KEY|^VITE_.*SECRET" .env 2>/dev/null && echo "⚠️ SENSITIVE KEY EXPOSED VIA VITE_" || echo "✅ Safe"
```

---

## 3. Performance Optimization Checklist

### 3.1 Bundle Size

| Area | Current Risk | Optimization |
|------|-------------|-------------|
| **recharts** | ~400KB — loaded even if user never visits Analytics | Lazy-load `Analytics.tsx` with `React.lazy()` |
| **@dnd-kit** | ~80KB — loaded even if user never visits Tracker | Lazy-load `ApplicationTracker.tsx` |
| **react-markdown** | ~50KB — only used in DocumentGenerator | Already scoped, but could be dynamically imported |

```bash
# Check bundle size
du -sh dist/ 2>/dev/null
# Aim for < 500KB gzipped for initial load
```

### 3.2 Network Efficiency

| Issue | Impact | Fix |
|-------|--------|-----|
| **No request deduplication** | Searching the same query twice makes two API calls | Add caching layer with `localStorage` TTL (5 min) |
| **Fetching all saved jobs on mount** | Loads all 100 jobs from DB on every page load | Paginate or fetch on-demand |
| **Full resume content in store** | Zustand persists full `parsed_data` JSONB to localStorage | Exclude `parsed_data` from `partialize` config |

### 3.3 Rendering Performance

| Issue | Impact | Fix |
|-------|--------|-----|
| **Re-renders on preferences change** | Object comparison in `useEffect` triggers re-render on every cycle | Use `JSON.stringify()` comparison or `useMemo` |
| **Kanban column re-renders** | Dragging one card re-renders ALL columns | Memoize individual `KanbanColumn` components |
| **Large document previews** | 10,000+ character documents cause layout thrashing | Virtualize long content or use `content-visibility: auto` |

### 3.4 Memory Leaks

```javascript
// Browser Console: Check for event listener leaks
// Open DocumentPreviewModal, close it, open again 10x
// Then run:
getEventListeners(document.body) // Should not show growing keydown listeners
```

---

## 4. Accessibility (a11y) Audit

### 4.1 Keyboard Navigation

| Element | Expected Behavior | Check |
|---------|------------------|-------|
| **Modal close** | `Escape` key closes DocumentPreviewModal | ✅ Implemented in `DocumentPreviewModal.tsx` |
| **Kanban drag** | Keyboard users can move cards between columns | ⚠️ `@dnd-kit` supports keyboard, but needs `KeyboardSensor` configuration |
| **Search input** | `Enter` triggers search, `Escape` clears | Verify in `JobSearch.tsx` |
| **Tab order** | All interactive elements reachable via Tab | Test with Tab key through each page |

### 4.2 Screen Reader Support

| Element | Required ARIA | Status |
|---------|--------------|--------|
| **DocumentPreviewModal** | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` | ✅ Implemented |
| **Kanban columns** | `role="region"`, `aria-label="Saved Jobs"` etc. | ⚠️ Verify |
| **Toast notifications** | `role="alert"`, `aria-live="assertive"` | Depends on `react-hot-toast` defaults |
| **Loading states** | `aria-busy="true"` on loading containers | ⚠️ Add to skeleton components |
| **Form inputs** | Associated `<label>` elements | ⚠️ Audit all forms |

### 4.3 Color Contrast

| Element | Foreground | Background | Ratio | Status |
|---------|-----------|-----------|-------|--------|
| Primary text | `#FFFFFF` | `#0A0A0A` | 21:1 | ✅ Pass |
| Muted text | `text-white/40` | `#0A0A0A` | ~3.2:1 | ⚠️ Fails WCAG AA (needs 4.5:1) |
| Success badge | `text-green-300` | `bg-green-500/10` | ~4.8:1 | ✅ Pass |
| ATS score label | `text-white/40` | `#0A0A0A` | ~3.2:1 | ⚠️ Fails — increase to `text-white/60` |

### 4.4 Motion & Animations

| Check | Requirement |
|-------|------------|
| **Reduced motion** | Respect `prefers-reduced-motion` media query |
| **Auto-playing animations** | None present — ✅ |
| **Flash content** | None present — ✅ |

```css
/* Add to index.css if missing */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Code Quality Standards

### 5.1 TypeScript Strictness

```bash
# Run type checker
npx tsc --noEmit

# Common issues to look for:
# - `any` type usage (should be minimized)
# - Missing return types on async functions
# - Unhandled Promise rejections
```

```bash
# Count `any` usage
grep -rn ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
# Target: < 20 instances across the project
```

### 5.2 Error Handling Patterns

**Required pattern for all Edge Function calls:**

```typescript
// ✅ CORRECT
try {
  const { data, error } = await supabase.functions.invoke('fn-name', { body })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  // Process data...
} catch (error: any) {
  showToast.error(error.message || 'Something went wrong')
  // Log for debugging
  console.error('Context:', error)
}

// ❌ WRONG — no error handling
const { data } = await supabase.functions.invoke('fn-name', { body })
return data.results // Will crash if data is null
```

### 5.3 Component Patterns

**Required pattern for modals with scroll lock:**

```typescript
// ✅ CORRECT — cleanup on unmount
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'unset'
  }
  return () => {
    document.body.style.overflow = 'unset' // Cleanup
  }
}, [isOpen])
```

### 5.4 File Organization Rules

| Category | Location | Naming |
|----------|---------|--------|
| Pages | `src/pages/` | PascalCase (`JobDetails.tsx`) |
| Components | `src/components/` | PascalCase (`DocumentPreviewModal.tsx`) |
| UI Atoms | `src/components/ui/` | PascalCase (`Button.tsx`) |
| Layouts | `src/components/layout/` | PascalCase (`MainLayout.tsx`) |
| Stores | `src/stores/` | camelCase (`career.ts`) |
| Services | `src/services/` | camelCase (`adzuna.ts`) |
| Types | `src/types/` | camelCase (`index.ts`) |
| Utilities | `src/utils/` | camelCase (`toast.ts`) |
| Edge Functions | `supabase/functions/{name}/` | kebab-case (`search-jobs`) |

---

## 6. Regression Test Matrix

Use this matrix when testing any new feature to ensure nothing breaks.

### Critical User Flows

| # | Flow | Steps | Expected | Priority |
|---|------|-------|----------|----------|
| 1 | **Auth → Dashboard** | Sign in → OTP → Land on Dashboard | Dashboard loads with stats | P0 |
| 2 | **Search → Save** | Search "developer" → Click Save on result | Job appears in Tracker "Saved" column | P0 |
| 3 | **Generate Document** | Select job → Select resume → Generate | Preview renders, ATS score shown | P0 |
| 4 | **PDF Export** | Open document → Click Download PDF | Print dialog opens, fits 1 page | P1 |
| 5 | **Kanban Drag** | Drag card from "Saved" → "Applied" | Status updates, date auto-set | P1 |
| 6 | **Resume Upload** | Upload PDF → Parse completes | Skills, experience, education extracted | P1 |
| 7 | **Deep Match** | Toggle AI Deep Match → Search | Jobs ranked with match scores | P2 |
| 8 | **Company Research** | Click "Research" on Job Details | Company insights display | P2 |
| 9 | **Mobile Modal** | Open doc preview on mobile | Actions at top, no bottom nav obstruction | P1 |
| 10 | **Logout → Clean State** | Click Logout | All stores cleared, redirect to `/auth` | P0 |

### Edge Cases to Verify

| Case | Scenario | Expected Behavior |
|------|----------|-------------------|
| Empty state | New user, no jobs/resumes | EmptyState components render with CTAs |
| 100 job limit | User has 100 saved jobs | "Limit reached" warning shown, save button disabled |
| Long content | Resume with 20+ experiences | Preview scrolls properly, PDF may be 2 pages |
| Network failure | Offline during search | Error toast shown, previous results preserved |
| Concurrent edits | Two tabs, edit same job | Last write wins, no data corruption |
| Special characters | Company name with `&`, `<`, `"` | Renders correctly, no XSS |

---

## 7. Quick Reference Commands

```bash
# === BUILD & TYPE CHECKS ===
npm run build                    # Full production build
npx tsc --noEmit                # Type check only
npm run lint                    # ESLint

# === SECURITY SCANS ===
grep -rn "dangerouslySetInnerHTML" src/
grep -rn "eval(" src/
grep -rn "sk-\|pplx-\|ADZUNA_APP_KEY" src/ dist/
grep -E "^VITE_.*API_KEY|^VITE_.*SECRET" .env

# === CODE QUALITY ===
grep -rn ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
grep -rn "console.log" src/ --include="*.ts" --include="*.tsx" | wc -l

# === BUNDLE ANALYSIS ===
du -sh dist/
npx vite-bundle-visualizer

# === SUPABASE ===
supabase functions list
supabase functions logs search-jobs --limit 20
```
