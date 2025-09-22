### Security
- [ ] F-01 Replace hardcoded Supabase creds with env vars and unify client
- [ ] F-02 Restrict admin selects to explicit columns or views
- [ ] F-03 Tighten public-read policies; add policy tests
- [ ] F-05 Partition storage uploads by user folder

### Performance
- [ ] F-04 Add width/height to images; verify CLS in Lighthouse
- [ ] F-09 Verify lazy-loading heavy deps; confirm vendor split

### Accessibility
- [ ] F-04 Ensure images have alt text and explicit dimensions
- [ ] F-10 Add error reporting without degrading UX

### DX
- [ ] F-06 Unify Supabase client import path
- [ ] F-07 Provide .env.example and README notes
- [ ] F-08 Add tests for admin gate and RLS RPC
