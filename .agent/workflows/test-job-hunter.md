---
description: Run the Job Hunter quality assurance workflow — bugs, security, performance, and accessibility checks
---

# Job Hunter QA Workflow

Run this workflow after any feature change, before merging PRs, or when debugging production issues.

## Phase 1: Static Analysis & Build Verification

1. Run the TypeScript compiler to catch type errors:
```bash
npx tsc --noEmit
```

2. Run the linter:
```bash
npm run lint
```

3. Run a production build to catch bundling issues:
```bash
npm run build
```

## Phase 2: Component Smoke Tests

4. Start the dev server and verify critical pages render:
```bash
npm run dev
```

5. Open the app in a browser and manually verify:
   - [ ] `/auth` → Login form renders, OTP flow works
   - [ ] `/dashboard` → Stats cards load, no console errors
   - [ ] `/jobs` → Search returns results, Deep Match toggle works
   - [ ] `/jobs/:id` → Job details display, document cards clickable
   - [ ] `/tracker` → Kanban columns render, drag-and-drop functional
   - [ ] `/resume` → Upload flow works, parsed data displays
   - [ ] `/generate` → Document generation completes, preview renders
   - [ ] `/analytics` → Charts render with data
   - [ ] `/profile` → Profile form loads and saves

## Phase 3: Security Checklist

6. Verify environment variables are not exposed in client bundle:
```bash
grep -r "OPENAI_API_KEY\|ADZUNA_APP_KEY\|PERPLEXITY_API_KEY" dist/ 2>/dev/null && echo "⚠️ SECRETS EXPOSED" || echo "✅ No secrets in bundle"
```

7. Verify RLS policies are active on all user tables:
```bash
# In Supabase SQL editor, run:
# SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
# All user tables should show rowsecurity = true
```

8. Check for XSS vectors in user-generated content:
   - [ ] Job descriptions are HTML-stripped before rendering
   - [ ] Notes inputs are sanitized
   - [ ] Generated document content uses safe rendering

## Phase 4: Mobile Responsiveness

9. Test on mobile viewport (375px wide):
   - [ ] BottomNav visible and functional
   - [ ] DocumentPreviewModal actions at top, not obstructed
   - [ ] Modal scroll lock prevents background scrolling
   - [ ] PDF export fits on single page
   - [ ] No horizontal overflow on any page

## Phase 5: Performance

10. Check bundle size:
```bash
npx vite-bundle-visualizer
```

11. Verify no memory leaks in modals:
   - [ ] Open/close DocumentPreviewModal 10 times → no increasing memory
   - [ ] Body overflow resets to 'unset' after every close
