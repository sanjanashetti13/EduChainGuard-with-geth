# Phase 0 — Foundation Summary

**Status:** Complete  
**Scope:** Dependencies, design tokens, API layer, React Query, Sonner, form validation architecture  
**Not included:** Page rebuilds, AppShell, chain selector UI (prepared via `lib/chains.ts`)

---

## Dependencies added

| Package | Purpose |
|---------|---------|
| `@tanstack/react-query` | Server state / API caching |
| `@tanstack/react-query-devtools` | Dev-only query inspector |
| `react-hook-form` | Form state |
| `@hookform/resolvers` | Zod resolver for RHF |
| `zod` | Schema validation |
| `next-themes` | Light / dark / system theme |
| `sonner` | Toast notifications |
| `tailwindcss-animate` | shadcn animations |
| `@radix-ui/react-label` | Accessible labels |
| `@radix-ui/react-tooltip` | Tooltips |

---

## New files

```
src/
├── app/providers.tsx          # QueryClient, Theme, Tooltip, Google OAuth, Sonner
├── styles/globals.css         # Design tokens + @tailwind + legacy blueGray aliases
├── lib/
│   ├── env.ts
│   ├── chains.ts              # Geth 1337 + Polygon Amoy definitions (for Phase 1 UI)
│   ├── query-client.ts
│   ├── query-keys.ts
│   └── api/
│       ├── client.ts          # Typed fetch wrapper
│       ├── errors.ts
│       ├── types.ts
│       ├── auth.ts
│       ├── admin.ts
│       ├── institute.ts       # Includes /institute/upload (Amoy)
│       ├── verifier.ts        # Includes /verifier/verify-pdf (Amoy)
│       ├── ipfs.ts
│       └── index.ts
├── features/auth/
│   ├── schemas.ts             # loginSchema, registerSchema, googleRoleSchema
│   ├── hooks.ts               # React Query auth mutations + Sonner
│   └── index.ts
└── hooks/
    ├── useAuth.ts             # localStorage user sync
    └── useFormWithSchema.ts
└── components/ui/
    ├── label.tsx
    ├── form.tsx
    ├── card.tsx
    ├── tooltip.tsx
    └── sonner.tsx
```

---

## Modified files

| File | Change |
|------|--------|
| `package.json` | New dependencies |
| `tailwind.config.js` | shadcn semantic colors, `darkMode: class`, animate plugin |
| `components.json` | CSS path → `src/styles/globals.css` |
| `src/index.js` | `AppProviders`, `globals.css`; removed Notus `tailwind.css` + `auth-shadcn-tokens.css` |
| `src/App.tsx` | `/landing` → redirect `/` |
| `src/layouts/Admin.js` | `/admin/maps` → redirect `/admin/dashboard` |

---

## Design system

- **Tokens:** HSL CSS variables in `globals.css` (`:root` + `.dark`)
- **Palette:** Stripe/Vercel-inspired blue primary, neutral surfaces
- **Typography:** Inter (Google Fonts)
- **Legacy bridge:** `@layer utilities` maps common `blueGray-*` / `lightBlue-*` classes to semantic tokens so existing Notus views remain usable until Phase 1+

---

## API client

- Base URL: `REACT_APP_API_URL` or `http://localhost:5000`
- All Flask routes preserved in `lib/api/*`
- **Dual chain (API ready):**
  - `instituteApi.uploadPdf` → `POST /institute/upload` (Amoy / server-signed)
  - `instituteApi.recordUpload` → MetaMask path metadata
  - `verifierApi.verifyPdf` → `POST /verifier/verify-pdf`
  - `verifierApi.recordVerify` → MetaMask path metadata

---

## Form validation architecture

```ts
// Schema
import { loginSchema } from "features/auth";

// Form
import { useFormWithSchema } from "hooks/useFormWithSchema";
const form = useFormWithSchema(loginSchema);

// Submit
import { useManualLoginMutation } from "features/auth";
const login = useManualLoginMutation();
login.mutate({ email, password });
```

Auth mutations call `setAuthUser()` and show Sonner toasts on success/error.

---

## Providers tree

```
GoogleOAuthProvider
  └── QueryClientProvider
        └── ThemeProvider (class)
              └── TooltipProvider
                    ├── {routes}
                    └── Toaster (Sonner)
```

---

## What still uses legacy UI

- All `views/*` and Notus `layouts/*` unchanged (visual regression possible on some custom classes)
- Font Awesome still loaded for existing sidebars/nav
- `utils/blockchain.js` / `utils/web3.js` untouched

---

## Next: Phase 1

1. `AppShell`, `AppSidebar`, `TopNavbar`
2. Replace `layouts/Admin.js` shell
3. `RequireAuth` guard
4. Chain selector + status on Upload/Verify (using `lib/chains.ts`)

---

## Verify locally

```bash
cd frontend
npm start
```

Confirm: app boots, theme class on `<html>`, Sonner available, React Query Devtools (dev), `/landing` redirects to `/`.
