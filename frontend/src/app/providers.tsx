import React, { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "next-themes";

import { Toaster } from "components/ui/sonner";
import { TooltipProvider } from "components/ui/tooltip";
import { ChainModeProvider } from "contexts/ChainModeContext";
import { GOOGLE_CLIENT_ID } from "lib/env";
import { createQueryClient } from "lib/query-client";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ChainModeProvider>
            <TooltipProvider delayDuration={300}>
              {children}
              <Toaster richColors closeButton position="top-right" />
            </TooltipProvider>
          </ChainModeProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
