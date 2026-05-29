# EduChainGuard Frontend Migration Plan

**Role:** Senior React architect review  
**Scope:** Full frontend redesign (21st.dev / shadcn SaaS aesthetic)  
**Constraints:** No backend API changes, no smart contract changes, routing structure preserved  
**Status:** Analysis complete — **no implementation started**

---

## 1. Executive summary

The current frontend is a **layered fork** of **Notus React** (Creative Tim) with partial shadcn/ui experiments, Web3 utilities, and several **unwired** alternate auth/marketing pages. It works functionally but fails modern SaaS cohesion: mixed color systems (`blueGray-*` vs neon `#00ff88` vs zinc shadcn tokens), Font Awesome vs Lucide, compiled Tailwind v2 CSS blob (~3k lines), and duplicated API clients.

**Recommended approach:** Incremental **strangler migration** inside CRA (keep `react-scripts` unless you later move to Vite). Establish a **single design system + API layer first**, then replace pages one route at a time while keeping `App.tsx` route paths stable.

**Estimated effort:** 5–8 focused dev days for core pages + shell; +2 days for IPFS/profile/settings polish and QA.

---

## 2. Current frontend audit

### 2.1 Stack (as-is)

| Area | Current |
|------|---------|
| Framework | React 19 + Create React App 5 |
| Routing | `react-router-dom` v6 |
| Styling | Tailwind 3 config + **prebuilt Notus `tailwind.css`** (not `@tailwind` layers) |
| Partial shadcn | `button.tsx`, `input.tsx`, `components.json`, `lib/utils.ts` |
| Icons | Font Awesome (global CSS), Lucide (some pages), react-icons (package present) |
| Animation | Framer Motion, GSAP, Three.js / R3F (demos) |
| Charts | Recharts |
| Auth | `@react-oauth/google`, `localStorage.user` |
| Blockchain | `web3.js` + `utils/web3.js`, `utils/blockchain.js`, MetaMask |
| HTTP | Raw `fetch` + `axios` (Tables, IPFS) — **no central client** |
| Forms | Uncontrolled inputs, no Zod/RHF |
| State/server cache | `useEffect` + `useState` only |

### 2.2 Route map (must preserve)

**`App.tsx` (top level)**

| Path | Layout / view | Role |
|------|----------------|------|
| `/` | `views/Index.js` | Public home (dark neon) |
| `/landing` | `views/Landing.js` | Notus marketing placeholder |
| `/auth/*` | `layouts/Auth.js` | Login, Register |
| `/admin/*` | `layouts/Admin.js` | App shell + nested routes |
| `/upload-ipfs` | `layouts/IpfsUploadLayout.tsx` | Pinata upload |
| `/profile` | `views/Profile.js` | User profile |
| `*` | → `/` | Catch-all |

**`layouts/Admin.js` (nested)**

| Path | View | Primary audience |
|------|------|------------------|
| `/admin/dashboard` | `Dashboard.js` | Admin |
| `/admin/upload` | `UploadCertificate.js` | Institute |
| `/admin/verify` | `VerifyCertificate.js` | Verifier |
| `/admin/tables` | `Tables.js` | Admin (user activity) |
| `/admin/maps` | `Maps.js` | Template stub |
| `/admin/settings` | `Settings.js` | Admin (clear logs) |
| `/admin/profile` | `admin/Profile.js` | All roles |
| `/admin/*` | → `/admin/dashboard` | Default |

**Post-login redirects** (`Login.js`, `routeForRole.ts`):

- `admin` → `/admin/dashboard`
- `institute` → `/admin/upload`
- `verifier` → `/admin/verify`
- default → `/`

### 2.3 API integration inventory (do not change contracts)

Centralize these in `src/lib/api/` + React Query hooks; **payloads and URLs unchanged**.

#### Auth

| Method | Endpoint | Used by | Request | Response (success) |
|--------|----------|---------|---------|-------------------|
| POST | `/api/auth/manual-login` | `Login.js` | `{ email, password }` | `{ message, user: { name, email, role } }` |
| POST | `/api/auth/manual-register` | `Register.js` | `{ name, email, password, role }` | `{ message }` |
| POST | `/api/auth/google-login` | Login, Register | `{ token }` | `{ user }` or `{ newUser, name, email, token }` |
| POST | `/api/auth/google-register` | Register | `{ token, role }` | `{ message, user }` |

**Client storage:** `localStorage.setItem("user", JSON.stringify(user))` — preserve behavior.

#### Institute / verifier (client-side chain + metadata)

| Method | Endpoint | Used by | Notes |
|--------|----------|---------|-------|
| POST | `/institute/record-upload` | `UploadCertificate.js` | JSON: `{ email, tx_hash, hash, filename }` — after MetaMask upload |
| POST | `/verifier/record-verify` | `VerifyCertificate.js` | JSON: `{ email, hash, verified }` |

**Not currently called from UI** (but exist on backend — optional future hook, out of scope unless you explicitly re-enable Amoy server mode):

- `POST /institute/upload` (multipart PDF + Flask signs Amoy)
- `POST /verifier/verify-pdf` (multipart PDF + Flask verifies Amoy)

#### Admin / analytics

| Method | Endpoint | Used by |
|--------|----------|---------|
| GET | `/admin/stats` | `Dashboard.js` |
| GET | `/admin/uploads-per-day` | `UploadsChart.js` |
| GET | `/admin/user-activity` | `Tables.js` |
| GET | `/admin/verifier-activity` | `Tables.js` |
| DELETE | `/admin/clear-logs` | `CardSettings.js` via Settings |

#### IPFS

| Method | Endpoint | Used by |
|--------|----------|---------|
| POST | `/upload-to-pinata` | `IpfsUploadPage.tsx` (multipart `file`) |

#### Env vars (frontend)

| Variable | Purpose |
|----------|---------|
| `REACT_APP_API_URL` | Base URL (only some TS files; most hardcode `localhost:5000`) |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth |
| `REACT_APP_CONTRACT_ADDRESS_LOCAL` | Geth CertificateStorage address |

### 2.4 Blockchain integration (preserve logic, refactor wrappers only)

**Keep unchanged behavior:**

| Module | Responsibility |
|--------|----------------|
| `utils/web3.js` | MetaMask, chain 1337, `loadBlockchain`, `ensureLocalGethNetwork` |
| `utils/blockchain.js` | `hashFileSha256Hex`, `uploadCertificate`, `verifyCertificate`, `formatBlockchainError` |
| `abis/CertificateStorage.json` | Contract ABI |
| `utils/shortenAddress.js` | Display helper |
| `utils/routeForRole.ts` | Role → dashboard path |

**Current upload/verify flow (important):**

1. User must be logged in (`localStorage.user.email`).
2. MetaMask required (`hasMetaMaskProvider()`).
3. File → SHA-256 in browser → `uploadCertificate` / `verifyCertificate` on **Local Geth (1337)**.
4. Then POST metadata to Flask `record-upload` / `record-verify`.
5. UI uses `alert()` on auth pages; banners on upload/verify.

**Do not modify:** ABI encoding (`hexSha256ToBytes32`), contract method names, chain ID 1337 assumptions in active flows.

### 2.5 Notus / legacy surface area

**Remove or replace (Notus-specific):**

| Category | Files / patterns |
|----------|------------------|
| Global FA CSS | `index.js` → `@fortawesome/fontawesome-free` |
| `blueGray-*` utilities | 30+ files |
| `fas fa-*` icons | Sidebar, Verify, dropdowns |
| Notus layouts | `layouts/Admin.js`, `Auth.js`, `IpfsUploadLayout` structure |
| Notus nav/footer | `AdminNavbar`, `AuthNavbar`, `IndexNavbar`, `Footer*`, dropdowns |
| Notus cards/charts/maps | `components/Cards/*`, `Maps/MapExample`, `HeaderStats` |
| Template views | `Landing.js` (Notus copy), `Maps.js`, unused card demos |
| Compiled CSS | `assets/styles/tailwind.css` (v2 Notus bundle) |
| Images | `assets/img/*` (team photos, sketch, vue, etc.) |

**Experimental / dead code (not in `App.tsx` routes):**

- `AuthPage.tsx`, `SignInGlass.tsx`, `IntegratedAuth.tsx`, `WelcomeGate.tsx`, `Home.tsx`, `EtherealDemo.tsx`
- `ui/sign-in-flow-1.tsx`, `sign-up.tsx`, `signup-1.tsx`, `background-boxes*`, `falling-pattern`, `ethereal*`, `shape-landing-hero`

**Keep logic, re-skin:**

- `WalletStatusBlock.jsx` → becomes **`WalletStatusCard`**
- `IpfsUploadPage.tsx` → new shell, same axios POST
- Upload/verify **business logic** (hash → chain → record API)

### 2.6 Role-based navigation (preserve rules)

| Role | Sidebar today | After migration (`AppSidebar`) |
|------|---------------|--------------------------------|
| admin | Dashboard, Tables, IPFS, Profile | Dashboard, **Analytics** (`/admin/tables`), IPFS, Profile |
| institute | Upload, IPFS, Profile | Upload, IPFS, Profile |
| verifier | Verify, IPFS, Profile | Verify, IPFS, Profile |
| student / other | **No links** | Keep explicit empty state or “Coming soon” |

---

## 3. Target architecture

### 3.1 Folder structure (proposed)

```
frontend/src/
├── index.tsx                    # Providers (migrate from index.js)
├── App.tsx                      # Routes unchanged
├── app/
│   ├── providers.tsx            # QueryClient, Theme, Google OAuth, Tooltip
│   └── routes.tsx               # Optional: route config object
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx         # Sidebar + TopNavbar + outlet
│   │   ├── AppSidebar.tsx
│   │   ├── TopNavbar.tsx
│   │   └── ThemeToggle.tsx
│   ├── blocks/                  # Composed marketing sections (21st.dev)
│   │   ├── HeroSection.tsx
│   │   ├── FeatureGrid.tsx
│   │   └── CtaSection.tsx
│   ├── domain/
│   │   ├── StatsCard.tsx
│   │   ├── ActivityTable.tsx
│   │   ├── UploadDropzone.tsx
│   │   ├── VerificationResultCard.tsx
│   │   └── WalletStatusCard.tsx
│   └── ui/                      # shadcn primitives
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── schemas.ts           # Zod
│   │   └── hooks.ts             # React Query mutations
│   ├── dashboard/
│   ├── upload/
│   ├── verify/
│   ├── analytics/
│   └── ipfs/
├── hooks/
│   ├── useAuth.ts
│   └── useWallet.ts
├── lib/
│   ├── api/
│   │   ├── client.ts            # fetch + base URL
│   │   ├── auth.ts
│   │   ├── admin.ts
│   │   ├── institute.ts
│   │   └── ipfs.ts
│   ├── query-keys.ts
│   └── utils.ts
├── styles/
│   └── globals.css              # @tailwind + CSS variables (light/dark)
├── utils/                       # KEEP: web3.js, blockchain.js (TS wrap optional)
└── abis/
```

### 3.2 Provider stack (`index.tsx`)

```tsx
<GoogleOAuthProvider>
  <QueryClientProvider>
    <ThemeProvider attribute="class" defaultTheme="system">
      <TooltipProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
</GoogleOAuthProvider>
```

### 3.3 API client pattern

```ts
// lib/api/client.ts
const API_BASE = process.env.REACT_APP_API_URL ?? "http://localhost:5000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? res.statusText);
  return data as T;
}
```

React Query hooks wrap each endpoint; pages consume hooks only (no inline `fetch` in views).

### 3.4 Auth pattern

- `useAuth()` reads/writes `localStorage.user`, exposes `user`, `setUser`, `logout`, `isAuthenticated`.
- Protected routes: wrapper `RequireAuth` + optional `RequireRole(['admin'])`.
- Replace `alert()` with **sonner** toasts (shadcn convention).

---

## 4. Design system specification

### 4.1 Aesthetic direction (21st.dev / enterprise SaaS)

Reference: **Stripe** (spacing, typography), **Clerk** (auth cards), **Vercel** (neutral palette, subtle borders), **Alchemy** (Web3 status chips).

| Token | Light | Dark |
|-------|-------|------|
| Background | `hsl(0 0% 100%)` | `hsl(222 47% 6%)` |
| Foreground | `hsl(222 47% 11%)` | `hsl(210 40% 98%)` |
| Primary | `hsl(222 89% 53%)` — confident blue | same hue, slightly brighter |
| Muted | `hsl(210 40% 96%)` | `hsl(217 33% 12%)` |
| Border | `hsl(214 32% 91%)` | `hsl(217 33% 18%)` |
| Success | emerald for verified | |
| Destructive | red for failed verify | |

- **Typography:** `Inter` or `Geist` via `@fontsource` or Google Fonts; scale: `text-sm` body, `text-2xl/3xl` page titles, `font-medium` labels.
- **Spacing:** 4px grid; page padding `p-6 lg:p-8`; section gaps `space-y-8`.
- **Radius:** `--radius: 0.5rem` (shadcn default); cards `rounded-lg`, buttons `rounded-md`.
- **Motion:** Framer Motion for page enter (`opacity + y: 8`), sidebar collapse, result card reveal — **subtle**, &lt; 300ms.

### 4.2 Tailwind reset (critical)

**Problem:** `assets/styles/tailwind.css` is a **Notus v2 compiled file**, not compatible with shadcn token workflow.

**Action:**

1. Replace with `src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root { /* shadcn light tokens */ }
  .dark { /* shadcn dark tokens */ }
}
```

2. Simplify `tailwind.config.js`: remove Notus `blueGray` overrides and px-hack `extend` entries unless still needed.
3. Point `components.json` → `"css": "src/styles/globals.css"`.

### 4.3 shadcn/ui components to install (phase 1)

`button`, `input`, `label`, `card`, `table`, `tabs`, `badge`, `avatar`, `dropdown-menu`, `separator`, `sheet` (mobile sidebar), `sonner`, `form`, `select`, `switch`, `skeleton`, `alert`, `tooltip`, `scroll-area`

**Radix:** Included via shadcn (already have `@radix-ui/react-slot`; add others as needed per component).

### 4.4 21st.dev integration workflow

1. Browse [21st.dev](https://21st.dev) for: **sidebar**, **navbar**, **auth card**, **stats grid**, **file upload**, **pricing/hero**.
2. Copy component into `components/blocks/` or `components/ui/`.
3. Normalize imports to `@/components/ui/*`, `cn()`, and design tokens.
4. Remove vendor-specific deps (replace with Lucide icons).
5. Do **not** import 21st blocks that pull Three.js/GSAP unless explicitly wanted on landing only.

---

## 5. Page rebuild mapping

| Page | Route(s) | New component | APIs / chain |
|------|----------|---------------|--------------|
| **Landing** | `/` and/or `/landing` | `features/marketing/LandingPage.tsx` | WalletStatusCard (read-only connect); CTA → `/auth/login` |
| **Login** | `/auth/login` | `features/auth/LoginPage.tsx` | manual-login, google-login; RHF + Zod |
| **Register** | `/auth/register` | `features/auth/RegisterPage.tsx` | manual-register, google-login/register |
| **Dashboard** | `/admin/dashboard` | `features/dashboard/DashboardPage.tsx` | `GET /admin/stats`; StatsCard grid; recent table |
| **Upload** | `/admin/upload` | `features/upload/UploadPage.tsx` | MetaMask flow + `record-upload`; UploadDropzone |
| **Verify** | `/admin/verify` | `features/verify/VerifyPage.tsx` | MetaMask + `record-verify`; VerificationResultCard |
| **Analytics** | `/admin/tables` (label: Analytics) | `features/analytics/AnalyticsPage.tsx` | user-activity + verifier-activity; ActivityTable + tabs |
| **IPFS** | `/upload-ipfs` | `features/ipfs/IpfsPage.tsx` | `POST /upload-to-pinata` |
| **Profile** | `/profile`, `/admin/profile` | `features/profile/ProfilePage.tsx` | local user + wallet card |
| **Settings** | `/admin/settings` | Minimal shadcn page | `DELETE /admin/clear-logs` |
| **Maps** | `/admin/maps` | Redirect → dashboard or stub “Not available” | Preserve route only |

**Landing vs `/`:** Recommend **`/` = new Landing** and **`/landing` redirects to `/`** to avoid duplicate marketing pages (route preserved via redirect).

---

## 6. Reusable component specifications

| Component | Responsibility | Replaces |
|-----------|----------------|----------|
| **AppSidebar** | Role-based nav, collapsible, Lucide icons, active state via `useLocation` | `Sidebar.js` |
| **TopNavbar** | Breadcrumb/title, ThemeToggle, wallet connect, user menu | `AdminNavbar.js` |
| **StatsCard** | Title, value, optional trend icon, skeleton loading | Dashboard `StatCard` |
| **ActivityTable** | Tabs: admin / institute / verifier; expandable rows for uploads/verifications | `Tables.js` tables |
| **UploadDropzone** | Drag-drop, accept PDF/images, preview, disabled while uploading | `InstituteUploadCard` + verify dropzone |
| **VerificationResultCard** | Verified/not + hash monospace + copy button | Verify result block |
| **WalletStatusCard** | MetaMask status, chain 1337 badge, connect CTA | `WalletStatusBlock` |

**App shell:** Single `AppShell` used by `Admin.js` and `IpfsUploadLayout.tsx` (eliminate duplicate layout markup).

---

## 7. Dependency changes

### 7.1 Add

```json
{
  "@tanstack/react-query": "^5.x",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "zod": "^3.x",
  "next-themes": "^0.4.x",
  "sonner": "^1.x",
  "@radix-ui/react-dialog": "...",
  "@radix-ui/react-dropdown-menu": "...",
  "@radix-ui/react-label": "...",
  "@radix-ui/react-select": "...",
  "@radix-ui/react-tabs": "...",
  "@radix-ui/react-tooltip": "...",
  "@radix-ui/react-separator": "...",
  "@radix-ui/react-switch": "...",
  "@radix-ui/react-slot": "(existing)"
}
```

(shadcn will pull exact Radix versions on `npx shadcn@latest add`.)

### 7.2 Remove (after migration)

| Package | Reason |
|---------|--------|
| `@fortawesome/fontawesome-free` | Lucide only |
| `@headlessui/react` | Radix via shadcn |
| `@heroicons/react` | Lucide |
| `react-icons` | Lucide |
| `@popperjs/core` | Not needed |
| `chart.js` | Use Recharts only |
| `gsap`, `three`, `@react-three/fiber` | Remove WebGL demos unless landing hero requires |
| `canvas-confetti` | Optional delight; not enterprise core |

### 7.3 Keep

`react`, `react-dom`, `react-router-dom`, `react-scripts`, `tailwindcss`, `ethers`, `web3`, `framer-motion`, `lucide-react`, `recharts`, `axios` (optional — can standardize on `fetch`), `@react-oauth/google`, `jwt-decode`, `class-variance-authority`, `clsx`, `tailwind-merge`

---

## 8. Phased migration plan

### Phase 0 — Foundation (Day 1)

- [ ] Add dependencies (React Query, RHF, Zod, next-themes, sonner).
- [ ] Replace `tailwind.css` with `globals.css` + shadcn tokens (light/dark).
- [ ] Run `npx shadcn@latest init` (align `components.json`).
- [ ] Create `lib/api/client.ts` + `query-keys.ts`.
- [ ] Migrate `index.js` → `index.tsx` with providers.
- [ ] Add `ThemeProvider` + `Toaster`.
- [ ] TypeScript: enable `strict` gradually (optional); keep `allowJs` during transition.

**Exit criteria:** App boots, theme toggle works, no FA CSS import.

### Phase 1 — App shell (Day 2)

- [ ] Build `AppSidebar`, `TopNavbar`, `AppShell`.
- [ ] Refactor `layouts/Admin.js` → thin wrapper rendering `<AppShell><Outlet /></AppShell>`.
- [ ] Refactor `IpfsUploadLayout.tsx` to use same shell.
- [ ] Add `RequireAuth` for `/admin/*` (redirect to `/auth/login` if no user).
- [ ] Implement `useAuth`, `useWallet` hooks.

**Exit criteria:** Navigate admin routes with new chrome; role-based sidebar matches current rules.

### Phase 2 — Auth pages (Day 3)

- [ ] `LoginPage` + `RegisterPage` with RHF/Zod schemas mirroring current fields/roles.
- [ ] Google OAuth buttons (same token flow as today).
- [ ] Toast instead of `alert`; same `localStorage` + `navigate()` targets.
- [ ] Replace `layouts/Auth.js` with minimal centered layout (Clerk-style split optional).
- [ ] Remove unused auth experiments from bundle (delete or move to `_archive`).

**Exit criteria:** Manual + Google auth parity with existing backend.

### Phase 3 — Core product pages (Days 4–5)

- [ ] **DashboardPage** — React Query for `/admin/stats`, chart for `/admin/uploads-per-day`.
- [ ] **UploadPage** — extract current `handleSubmit` logic; `UploadDropzone` + `WalletStatusCard`.
- [ ] **VerifyPage** — same chain flow; `VerificationResultCard`.
- [ ] **AnalyticsPage** — merge `Tables.js` data hooks into `ActivityTable`.

**Exit criteria:** End-to-end institute upload + verifier check on Geth 1337 with Mongo record sync.

### Phase 4 — Marketing + secondary (Day 6)

- [ ] **LandingPage** at `/` (21st.dev hero + feature grid).
- [ ] `/landing` → redirect `/`.
- [ ] **IpfsPage** re-skin; preserve Pinata integration.
- [ ] **ProfilePage** + **SettingsPage** (clear logs button).

**Exit criteria:** Public landing coherent with app shell aesthetic.

### Phase 5 — Cleanup (Day 7)

- [ ] Delete Notus components/files (see matrix below).
- [ ] Remove dead CSS (`ethereal.css`, `sign-up-styles.css`, compiled Notus tailwind).
- [ ] Unify `REACT_APP_API_URL` everywhere.
- [ ] Convert `blockchain.js` / `web3.js` to TypeScript re-exports (optional).
- [ ] Run `npm run build`, fix lint/types.
- [ ] Manual QA checklist (section 10).

### Phase 6 — Polish (optional)

- [ ] Route-level code splitting (`React.lazy`).
- [ ] React Query devtools.
- [ ] Skeleton loaders on all queries.
- [ ] Error boundaries per feature.

---

## 9. File lifecycle matrix

| Action | Paths |
|--------|-------|
| **Keep (logic)** | `utils/web3.js`, `utils/blockchain.js`, `utils/routeForRole.ts`, `utils/shortenAddress.js`, `abis/*` |
| **Replace** | All `views/*` targeted pages, `layouts/*`, Notus nav/sidebar/footer |
| **Delete** | `components/Cards/*`, `components/Dropdowns/*` (except patterns moved to shadcn), `components/Maps/*`, `components/Headers/*`, `components/Footers/*`, `components/Navbars/*`, `components/Sidebar/Sidebar.js`, `views/Landing.js`, `views/Index.js`, experimental `views/*` not routed, demo `ui/*` (ethereal, boxes, falling-pattern, sign-in-flow, etc.) |
| **Delete assets** | `assets/img/team-*`, template screenshots (keep logo/favicon only if needed) |
| **Replace styles** | `assets/styles/tailwind.css` → `styles/globals.css` |

---

## 10. QA / regression checklist

- [ ] Manual login for each role → correct redirect path.
- [ ] Google login (existing user) + Google register (new user + role).
- [ ] Institute: upload PDF → MetaMask tx → `record-upload` → appears in admin stats.
- [ ] Verifier: verify known hash → green result; unknown → red; `record-verify` logged.
- [ ] Admin dashboard stats + 7-day chart load.
- [ ] Analytics tables show institute uploads + verifier activity.
- [ ] IPFS upload returns CID + gateway URL.
- [ ] Settings clear logs works.
- [ ] Theme: light/dark/system persists across refresh.
- [ ] Mobile: sidebar sheet, tables scroll horizontally.
- [ ] Missing MetaMask → friendly error (not white screen).
- [ ] Missing `REACT_APP_CONTRACT_ADDRESS_LOCAL` → clear message.

---

## 11. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| CRA + shadcn path aliases | `baseUrl: "src"` already set; use `components/ui` alias from `components.json` |
| Removing compiled `tailwind.css` breaks unknown classes | Grep for `blueGray` before delete; replace with semantic tokens |
| React 19 + older shadcn peer warnings | Use latest shadcn CLI; test `npm run build` early |
| Dual landing (`/` vs `/landing`) | Redirect `/landing` → `/` |
| Polygonscan links on dashboard use Amoy while chain is Geth | Keep links as-is (historical txs) or gate by env — **do not change backend**; document in UI copy “Local Geth” |
| Student role empty nav | Add explicit UX so users aren’t stuck |

---

## 12. Implementation order (recommended PR slices)

1. **PR1:** Foundation (styles, providers, API client, shadcn core).
2. **PR2:** App shell + protected routes.
3. **PR3:** Auth pages.
4. **PR4:** Dashboard + Analytics.
5. **PR5:** Upload + Verify + domain components.
6. **PR6:** Landing + IPFS + Profile/Settings + deletion of Notus code.

---

## 13. Open decisions (confirm before coding)

1. **`/` vs `/landing`:** Single landing at `/` with redirect?
2. **Maps route:** Redirect to dashboard or keep placeholder?
3. **Amoy server upload path:** Keep MetaMask-only (current) or restore Flask multipart toggle?
4. **CRA vs Vite:** Stay on CRA for this sprint?
5. **Font:** Inter only, or Geist/IBM Plex?
6. **Analytics naming:** Nav label “Analytics” pointing to `/admin/tables` OK?

---

## 14. Summary

The migration is **feasible without backend changes** by:

1. Replacing the Notus CSS/layout layer with shadcn + a proper `globals.css`.
2. Centralizing APIs in React Query hooks.
3. Preserving **all route paths** and **MetaMask + record-upload/record-verify** flows.
4. Building seven named reusable components and a single **AppShell**.

**Next step:** Confirm open decisions in §13, then execute **Phase 0** (foundation).

---

*Document version: 1.0 — analysis only, no code changes applied.*
