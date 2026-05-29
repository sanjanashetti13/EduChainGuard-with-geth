# Phase 3 — Upload & Verify Pages Summary

**Status:** Complete  
**Build:** `npm run build` succeeds  
**Scope:** Rebuilt Upload and Verify with shadcn/ui, React Query, dual-chain support

---

## New pages

| Route | Component | Replaces |
|-------|-----------|----------|
| `/admin/upload` | `features/upload/UploadPage.tsx` | `views/admin/UploadCertificate.js` |
| `/admin/verify` | `features/verify/VerifyPage.tsx` | `views/verifier/VerifyCertificate.js` |

Legacy JS view files remain in the repo but are **no longer routed**.

---

## Reusable domain components (`src/components/domain/`)

| Component | Purpose |
|-----------|---------|
| **UploadDropzone** | Drag-and-drop + browse, loading/disabled states |
| **FileInfoCard** | Name, size, type, image preview |
| **HashPreviewCard** | SHA-256 display + copy to clipboard |
| **TransactionStatusCard** | Pending / success / error, tx hash, explorer link (Amoy), chain badge |
| **VerificationResultCard** | Verified / not found + hash card |
| **VerificationHistoryTable** | Loading skeleton, error, empty, status table |

Also added: `components/ui/alert.tsx`, `components/ui/skeleton.tsx`

---

## Dual-chain behavior

Active mode from `useChainMode()` / `chains.ts` (navbar switcher).

### Upload

| Mode | Flow | API / chain |
|------|------|-------------|
| **geth-local** (1337) | Hash in browser → MetaMask `uploadCertificate` → `record-upload` | `blockchain.js` + `instituteApi.recordUpload` |
| **polygon-amoy** (80002) | Multipart PDF → Flask signs & stores | `instituteApi.uploadPdf` |

- Amoy: **PDF only** (matches backend `allowed_file`)
- Geth: PDF or image (unchanged)

### Verify

| Mode | Flow | API / chain |
|------|------|-------------|
| **geth-local** | Hash → MetaMask `verifyCertificate` → `record-verify` | `blockchain.js` + `verifierApi.recordVerify` |
| **polygon-amoy** | Multipart PDF → Flask verifies & logs | `verifierApi.verifyPdf` |

- Amoy path does **not** call `record-verify` (backend already writes MongoDB).

---

## React Query

| Hook | Query / mutation |
|------|------------------|
| `useCertificateUploadMutation` | Upload + invalidate stats & institute uploads |
| `useInstituteUploadHistory` | `GET /institute/uploads/:email` |
| `useCertificateVerifyMutation` | Verify + invalidate stats & verifier history |
| `useVerifierHistory` | `GET /admin/verifier-activity` (filtered by user email) |

Service modules (no changes to `blockchain.js` / `web3.js`):

- `features/upload/certificateUpload.ts`
- `features/verify/certificateVerify.ts`

---

## UX

- **Sonner** toasts for success, warning (DB sync), and errors
- **No `alert()`** on these pages
- Pending states: dropzone spinner, button loaders, pending transaction card
- Post-upload: transaction card + hash card + chain badge + Polygonscan link on Amoy
- Post-verify: result card + hash + verification history table
- Page-level **ChainStatusBadge** + **ChainModeSwitcher** (in addition to navbar)
- Wallet readiness alert on Geth when MetaMask not connected

---

## Unchanged (per requirements)

- `utils/blockchain.js`, `utils/web3.js`
- Flask routes & payloads
- Smart contracts
- Other admin pages (Dashboard, Tables, etc.)

---

## How to test

```powershell
cd frontend
npm start
```

1. **Geth upload:** MetaMask on chain 1337 → upload PDF → confirm tx → see hash + tx  
2. **Amoy upload:** Switch to Polygon Amoy → PDF only → upload → server tx hash + explorer link  
3. **Geth verify:** File registered on Geth → verified; unknown file → not found  
4. **Amoy verify:** Switch to Amoy → verify PDF against server contract  
5. Check history tables populate after success  

---

## Next steps (optional)

- Phase 2: Auth pages (RHF + Zod) if not done  
- Phase 4: Landing, Dashboard, Analytics redesign  
- Remove deprecated `UploadCertificate.js`, `VerifyCertificate.js`, `institute/*` cards  

---

*Phase 3 complete — stopped per plan.*
