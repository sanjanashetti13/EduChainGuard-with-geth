import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  type ChainDefinition,
  type ChainMode,
  DEFAULT_CHAIN_MODE,
  getChainByMode,
  getStoredChainMode,
  setStoredChainMode,
} from "lib/chains";

type ChainModeContextValue = {
  mode: ChainMode;
  chain: ChainDefinition;
  setMode: (mode: ChainMode) => void;
};

const ChainModeContext = createContext<ChainModeContextValue | null>(null);

let chainListeners = new Set<() => void>();

function subscribeChain(listener: () => void) {
  chainListeners.add(listener);
  return () => chainListeners.delete(listener);
}

function emitChain() {
  chainListeners.forEach((l) => l());
}

export function ChainModeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(
    subscribeChain,
    getStoredChainMode,
    () => DEFAULT_CHAIN_MODE
  );

  const setMode = useCallback((next: ChainMode) => {
    setStoredChainMode(next);
    emitChain();
  }, []);

  const value = useMemo<ChainModeContextValue>(
    () => ({
      mode,
      chain: getChainByMode(mode),
      setMode,
    }),
    [mode, setMode]
  );

  return (
    <ChainModeContext.Provider value={value}>{children}</ChainModeContext.Provider>
  );
}

export function useChainMode(): ChainModeContextValue {
  const ctx = useContext(ChainModeContext);
  if (!ctx) {
    throw new Error("useChainMode must be used within ChainModeProvider");
  }
  return ctx;
}
