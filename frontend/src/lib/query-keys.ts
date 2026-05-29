/**
 * React Query key factory — keeps cache keys consistent across features.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },
  admin: {
    all: ["admin"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    uploadsPerDay: () => [...queryKeys.admin.all, "uploads-per-day"] as const,
    userActivity: () => [...queryKeys.admin.all, "user-activity"] as const,
    verifierActivity: () =>
      [...queryKeys.admin.all, "verifier-activity"] as const,
  },
  institute: {
    all: ["institute"] as const,
    uploads: (email: string) =>
      [...queryKeys.institute.all, "uploads", email] as const,
  },
  verifier: {
    all: ["verifier"] as const,
    history: (email: string) =>
      [...queryKeys.verifier.all, "history", email] as const,
  },
} as const;
