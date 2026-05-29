import { useCallback, useSyncExternalStore } from "react";

import type { AuthUser } from "lib/api/types";

const STORAGE_KEY = "user";

/** Stable snapshot cache — JSON.parse() must not run a fresh object every getSnapshot call. */
let cachedRaw: string | null | undefined = undefined;
let cachedUser: AuthUser | null = null;

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw === cachedRaw) {
    return cachedUser;
  }

  cachedRaw = raw;

  if (!raw) {
    cachedUser = null;
    return null;
  }

  try {
    cachedUser = JSON.parse(raw) as AuthUser;
  } catch {
    cachedUser = null;
  }

  return cachedUser;
}

let listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

export function setAuthUser(user: AuthUser | null): void {
  if (user) {
    const serialized = JSON.stringify(user);
    localStorage.setItem(STORAGE_KEY, serialized);
    cachedRaw = serialized;
    cachedUser = user;
  } else {
    localStorage.removeItem(STORAGE_KEY);
    cachedRaw = null;
    cachedUser = null;
  }
  emit();
}

/** Sync cache when another tab or legacy code writes localStorage directly. */
function syncCacheFromStorage(): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    if (!raw) {
      cachedUser = null;
    } else {
      try {
        cachedUser = JSON.parse(raw) as AuthUser;
      } catch {
        cachedUser = null;
      }
    }
  }
}

export function useAuth() {
  const user = useSyncExternalStore(
    subscribe,
    () => {
      syncCacheFromStorage();
      return readUser();
    },
    () => null
  );

  const logout = useCallback(() => {
    setAuthUser(null);
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user?.email),
    setUser: setAuthUser,
    logout,
  };
}

/** @deprecated Use setAuthUser — kept for gradual migration from direct localStorage writes */
export function persistUser(user: AuthUser): void {
  setAuthUser(user);
}
