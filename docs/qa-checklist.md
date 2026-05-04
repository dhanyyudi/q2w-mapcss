# Visual QA Checklist

## Light & Dark Mode

For each page, test BOTH modes:
- OS dark preference (no `data-theme` attribute)
- Explicit `data-theme="dark"`
- Explicit `data-theme="ocean"`, `forest`, `sunset`, `slate`

### Pages to verify

- [ ] `/index.html` — landing
- [ ] `/docs.html` — component gallery
- [ ] `/examples/choropleth.html`
- [ ] `/examples/dashboard.html`
- [ ] `/examples/heatmap.html`
- [ ] `/examples/poi.html`
- [ ] `/examples/categorized-real/`

### Things to check per page

- [ ] No light/white surfaces in dark mode (unless intentional, e.g. terminal mock)
- [ ] All text has sufficient contrast (DevTools color contrast inspector)
- [ ] Hero glow not too bright in dark mode
- [ ] Buttons clearly clickable (focus-visible visible on Tab)
- [ ] Spinner respects `prefers-reduced-motion: reduce`
- [ ] Mobile viewport (360px) — no horizontal overflow

### Routing

- [ ] `/docs.html` works
- [ ] `/components` rewrites to `/docs.html` (URL bar shows `/components`)
- [ ] No `ERR_TOO_MANY_REDIRECTS` on any internal link
- [ ] Anchor links work (`/docs.html#layers`, `#popup`, etc.)

### Deploy hygiene

- [ ] `https://q2w-mapcss.pages.dev/docs/audit.md` → 404
- [ ] `https://q2w-mapcss.pages.dev/docs/audit-2.md` → 404
- [ ] `https://q2w-mapcss.pages.dev/docs/audit-3.md` → 404
- [ ] `https://q2w-mapcss.pages.dev/docs/superpowers/` → 404
- [ ] `https://q2w-mapcss.pages.dev/dist/q2w-mapcss.css` → 200
