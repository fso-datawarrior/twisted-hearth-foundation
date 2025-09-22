### Measurement plan (CI/Local commands)
- Bundle size: run `npm run build` and record `dist/assets/*.js` sizes; largest chunk and total. Optionally `vite-bundle-visualizer`.
- Lighthouse: run `npm run build && npx http-server dist -p 4173` then `npx lhci collect --url=http://localhost:4173`.
- Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms.
- API latency: `submit_rsvp`, `register_team`, `upload_photo` via `supabase.functions.invoke` or RPC; log p50/p95.
- DB index scans: enable `auto_explain` in CI or query `pg_stat_user_indexes` after tests.

### Current signals (Assumptions where not measured)
- Build present; no bundle report. Three.js and framer likely in lazy routes; largest chunk unknown.
- Lighthouse report exists in repo; update after patches.

### After patches (targets)
- Bundle: no increase; largest main chunk < 180KB gzip; vendor split isolates three.js.
- CLS: < 0.05 on gallery/index due to image dims.
- Auth/RLS: admin page only fetches selected columns; storage uploads scoped per-user.

### CI suggestions
- Add job to fail if hardcoded Supabase URL/key detected by regex.
- Add job to compare dist size vs budget; warn on regression.
- Run `lhci autorun` on PRs.

### Lighthouse (desktop) – current
- Performance: 0.67
- Accessibility: 1.00
- Best Practices: 1.00
- SEO: 1.00
- PWA: n/a
