# Phase 1 — App Shell & Navigation Summary

**Status:** Complete  
**Build:** `npm run build` succeeds  
**Scope:** Infrastructure and navigation only — page content unchanged

---

## What was delivered

### New layout system (`src/components/layout/`)

| Component | Purpose |
|-----------|---------|
| **AppShell** | Fixed sidebar + sticky top bar + `PageContainer` |
| **AppSidebar** | Role-aware nav (desktop fixed + mobile sheet) |
| **TopNavbar** | Title, chain UI, wallet, theme, user menu |
| **PageContainer** | Consistent padding / optional `flush` for legacy pages |
| **ThemeToggle** | Light / dark / system via `next-themes` |
| **ChainModeSwitcher** | Select Geth Local vs Polygon Amoy (`lib/chains.ts`) |
| **ChainStatusBadge** | Active chain + connection health tooltip |
| **UserMenu** | Profile, workspace, sign out (Lucide + shadcn) |
| **AuthLayout** | Minimal auth chrome (no sidebar) |
| **NavbarWalletButton** | MetaMask connect when mode is `geth-local` |

### Context & hooks

| File | Purpose |
|------|---------|
| `contexts/ChainModeContext.tsx` | Persists `educhain:chain-mode` in localStorage |
| `hooks/useChainStatus.ts` | MetaMask chain/account vs selected mode |
| `lib/navigation.ts` | Nav items + `getPageTitle()` |
| `components/auth/RequireAuth.tsx` | Guards routes using `useAuth` / `localStorage.user` |

### shadcn/ui primitives added

`badge`, `separator`, `avatar`, `dropdown-menu`, `select`, `sheet`

### Layout replacements

| Before | After |
|--------|--------|
| `layouts/Admin.js` + Notus Sidebar/Navbar/Footer | `AppShell` + nested routes |
| `layouts/IpfsUploadLayout.tsx` | `AppShell` + `IpfsUploadPage` |
| `layouts/Auth.js` + AuthNavbar/Footer | `AuthLayout` |
| `/profile` bare view | `ProfileShell` + `RequireAuth` + `AppShell` |
| `RootChrome` ethereal strip | Removed from `App.tsx` |

### Routing & auth

- `/admin/*`, `/upload-ipfs`, `/profile` → **`RequireAuth`** (redirect to `/auth/login`)
- `/landing` → `/` (unchanged from Phase 0)
- `/admin/maps` → `/admin/dashboard` (unchanged)
- Public: `/`, `/auth/*`

### Role-based navigation

| Role | Sidebar links |
|------|----------------|
| **admin** | Dashboard, Analytics, IPFS, Settings, Profile |
| **institute** | Upload, IPFS, Profile |
| **verifier** | Verify, IPFS, Profile |
| **student** | Profile + disabled “Student portal” (coming soon) |

### Chain UI (navbar)

- **Prominent:** `ChainStatusBadge` shows network short name + chain ID
- **Switcher:** `ChainModeSwitcher` sets mode for Phase 2 upload/verify flows
- **Geth mode:** wallet connect button + status (wrong network / disconnected / ready)
- **Amoy mode:** badge shows “Flask signs on Amoy” (server-signing status)

**Note:** Upload/Verify **pages** still use existing MetaMask-only logic until Phase 3 wires `useChainMode()` into submit handlers. Blockchain utils (`web3.js`, `blockchain.js`) were **not modified**.

---

## Files modified (high level)

- `src/App.tsx` — auth guards, removed `RootChrome`
- `src/app/providers.tsx` — `ChainModeProvider`
- `src/layouts/Admin.js`, `Auth.js`, `IpfsUploadLayout.tsx`
- `src/layouts/ProfileShell.tsx` (new)
- `src/views/Profile.js` — removed duplicate navbar/footer (shell provides chrome)
- `src/react-app-env.d.ts` — `window.ethereum` types

## Not removed yet (Phase 5+)

Legacy Notus files remain in repo but are **unused** by active layouts:

- `components/Sidebar/Sidebar.js`
- `components/Navbars/AdminNavbar.js`, `AuthNavbar.js`
- `components/Footers/*`
- `components/Dropdowns/UserDropdown.js`
- Font Awesome still in `index.js` for **legacy page content** (`fas` in Profile, Verify, etc.)

---

## How to test

```powershell
cd frontend
npm start
```

1. Sign in as admin / institute / verifier → confirm sidebar links differ  
2. Toggle theme (navbar) → light/dark  
3. Switch chain mode → badge updates (Geth 1337 vs Amoy 80002)  
4. Geth mode → connect wallet in navbar  
5. Visit `/admin/dashboard` logged out → redirect to login  
6. Student role → “Student portal” disabled + Profile link  

---

## Next: Phase 2 — Auth pages

- Rebuild Login/Register with RHF + Zod + shadcn
- Use `features/auth` mutations (already from Phase 0)
- Remove `alert()` from legacy auth views

## Next: Phase 3 — Upload / Verify

- `UploadDropzone`, `VerificationResultCard`
- Branch on `useChainMode()`:
  - `geth-local` → existing MetaMask + `record-upload` / `record-verify`
  - `polygon-amoy` → `instituteApi.uploadPdf` / `verifierApi.verifyPdf`

---

*Phase 1 complete — stopped before page redesign per plan.*
